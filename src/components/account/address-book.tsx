"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { repo, useRepoQuery } from "@/lib/repo";
import { useSession } from "@/lib/session";
import { addressSchema, EMIRATES } from "@/lib/checkout-schema";
import type { Address } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = addressSchema.extend({ label: z.string().trim().max(30).optional(), isDefault: z.boolean().optional() });
type FormValues = z.infer<typeof formSchema>;

export function AddressBook() {
  const t = useTranslations("account");
  const c = useTranslations("checkout");
  const common = useTranslations("common");
  const v = useTranslations("validation");
  const em = useTranslations("emirates");
  const locale = useLocale();
  const { user } = useSession();
  const { data, loading, refetch } = useRepoQuery(() => repo.listAddresses(user!.id), [user?.id], !!user);
  const [editing, setEditing] = useState<Address | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });
  const errors = form.formState.errors;
  const err = (m?: string) => (m ? v(m as "required") : null);

  const openForm = (a: Address | null) => {
    setEditing(a);
    form.reset(
      a
        ? { ...a, notes: a.notes ?? "", label: a.label ?? "" }
        : { label: "", fullName: user?.name ?? "", phone: "", area: "", street: "", building: "", notes: "", isDefault: !data?.length },
    );
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    await repo.saveAddress(user!.id, { ...values, id: editing?.id });
    toast.success(t("addressSaved"));
    setOpen(false);
    refetch();
  });

  const remove = async (a: Address) => {
    if (!a.id || !window.confirm(t("confirmDelete"))) return;
    await repo.deleteAddress(user!.id, a.id);
    toast(t("addressDeleted"));
    refetch();
  };

  const fields: { name: "fullName" | "phone" | "area" | "street" | "building"; label: string; type?: string; auto: string }[] = [
    { name: "fullName", label: c("fullName"), auto: "name" },
    { name: "phone", label: c("phone"), type: "tel", auto: "tel" },
    { name: "area", label: c("area"), auto: "address-level2" },
    { name: "street", label: c("street"), auto: "address-line1" },
    { name: "building", label: c("building"), auto: "address-line2" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="font-display text-3xl">{t("addresses")}</h2>
        <Button size="sm" onClick={() => openForm(null)}>
          <Plus aria-hidden /> {t("addAddress")}
        </Button>
      </div>

      {loading || !data ? (
        <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
          <Skeleton className="h-44 rounded-none" />
          <Skeleton className="h-44 rounded-none" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 border border-dashed px-6 py-16 text-center">
          <MapPin className="size-8 text-gold-deep" strokeWidth={1.2} aria-hidden />
          <p className="font-display text-2xl">{t("noAddresses")}</p>
          <p className="text-sm text-muted-foreground">{t("noAddressesBody")}</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((a) => (
            <li key={a.id} className="flex flex-col border bg-card p-6">
              <div className="flex items-center gap-3">
                <p className="font-display text-xl">{a.label || a.fullName}</p>
                {a.isDefault && <span className="border border-gold/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-gold-deep rtl:tracking-normal">{t("default")}</span>}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {a.fullName}<br />{a.building}, {a.street}<br />{a.area}, {em(a.emirate)}<br /><span dir="ltr">{a.phone}</span>
              </p>
              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="xs" onClick={() => openForm(a)}>
                  <Pencil aria-hidden /> {common("edit")}
                </Button>
                <Button variant="ghost" size="xs" onClick={() => remove(a)}>
                  <Trash2 aria-hidden /> {common("delete")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto rounded-none sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">{editing ? t("editAddress") : t("addAddress")}</DialogTitle>
            <DialogDescription className="sr-only">{t("addresses")}</DialogDescription>
          </DialogHeader>
          <form id="address-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="ad-label">{t("label")}</Label>
              <Input id="ad-label" className="h-11 rounded-none" {...form.register("label")} />
            </div>
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={`ad-${f.name}`}>{f.label}</Label>
                <Input
                  id={`ad-${f.name}`}
                  type={f.type}
                  dir={f.name === "phone" ? "ltr" : undefined}
                  autoComplete={f.auto}
                  className="h-11 rounded-none"
                  aria-invalid={!!errors[f.name]}
                  {...form.register(f.name)}
                />
                {errors[f.name] && <p className="text-xs text-destructive">{err(errors[f.name]?.message)}</p>}
              </div>
            ))}
            <div className="space-y-2">
              <Label htmlFor="ad-emirate">{c("emirate")}</Label>
              <Controller
                control={form.control}
                name="emirate"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange} dir={locale === "ar" ? "rtl" : "ltr"}>
                    <SelectTrigger id="ad-emirate" aria-invalid={!!errors.emirate} className="h-11! w-full rounded-none">
                      <SelectValue placeholder={c("emiratePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent position="popper" className="rounded-none">
                      {EMIRATES.map((e) => (
                        <SelectItem key={e} value={e}>{em(e)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.emirate && <p className="text-xs text-destructive">{err(errors.emirate.message)}</p>}
            </div>
            <Controller
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-3 text-sm sm:col-span-2">
                  <Checkbox checked={!!field.value} onCheckedChange={(ch) => field.onChange(ch === true)} />
                  {t("setDefault")}
                </label>
              )}
            />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{common("cancel")}</Button>
            <Button type="submit" form="address-form" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? common("saving") : common("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
