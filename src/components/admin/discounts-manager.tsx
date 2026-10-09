"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { repo, useRepoQuery } from "@/lib/repo";
import type { DiscountCode } from "@/lib/types";
import { useDateFormat } from "@/components/account/order-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyRow, PageHeader, fieldCls, tdCls, thCls, useAed } from "./admin-ui";
import { cn, uid } from "@/lib/utils";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
  z.number().min(0).optional(),
);

const schema = z
  .object({
    code: z.string().trim().min(3).max(24).regex(/^[A-Za-z0-9_-]+$/),
    type: z.enum(["percent", "fixed"]),
    value: z.number().positive(),
    minSubtotalAed: optionalNumber,
    expiresAt: z.string().optional(),
    active: z.boolean(),
  })
  .refine((d) => d.type !== "percent" || d.value <= 90, { path: ["value"] });

type In = z.input<typeof schema>;
type Out = z.output<typeof schema>;

export function DiscountsManager() {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const v = useTranslations("validation");
  const locale = useLocale();
  const aed = useAed();
  const fmt = useDateFormat();
  const { data, loading, refetch } = useRepoQuery(() => repo.listDiscounts());
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [open, setOpen] = useState(false);
  const form = useForm<In, unknown, Out>({ resolver: zodResolver(schema) });
  const errors = form.formState.errors;
  const type = useWatch({ control: form.control, name: "type" });

  const openForm = (d: DiscountCode | null) => {
    setEditing(d);
    form.reset(
      d
        ? { code: d.code, type: d.type, value: d.value, minSubtotalAed: d.minSubtotalAed, expiresAt: d.expiresAt?.slice(0, 10) ?? "", active: d.active }
        : { code: "", type: "percent", value: 10, minSubtotalAed: undefined, expiresAt: "", active: true },
    );
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const code = values.code.toUpperCase();
    if (data?.some((d) => d.code === code && d.id !== editing?.id)) {
      form.setError("code", { message: "taken" });
      return;
    }
    await repo.saveDiscount({
      id: editing?.id ?? uid("d"),
      code,
      type: values.type,
      value: values.value,
      minSubtotalAed: values.minSubtotalAed,
      expiresAt: values.expiresAt ? new Date(`${values.expiresAt}T23:59:59+04:00`).toISOString() : null,
      active: values.active,
      usageCount: editing?.usageCount ?? 0,
    });
    toast.success(t("discountSaved"));
    setOpen(false);
    refetch();
  });

  const remove = async (d: DiscountCode) => {
    if (!window.confirm(common("confirm"))) return;
    await repo.deleteDiscount(d.id);
    toast(t("discountDeleted"));
    refetch();
  };

  const toggle = async (d: DiscountCode) => {
    await repo.saveDiscount({ ...d, active: !d.active });
    refetch();
  };

  return (
    <div>
      <PageHeader
        title={t("discounts")}
        actions={
          <Button size="sm" onClick={() => openForm(null)}>
            <Plus aria-hidden /> {t("newDiscount")}
          </Button>
        }
      />
      <div className="relative overflow-x-auto border bg-background">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-card">
            <tr>
              <th className={thCls}>{t("code")}</th>
              <th className={thCls}>{t("value")}</th>
              <th className={thCls}>{t("minSubtotal")}</th>
              <th className={thCls}>{t("expires")}</th>
              <th className={cn(thCls, "text-end")}>{t("usage")}</th>
              <th className={thCls}>{t("active")}</th>
              <th className={thCls}><span className="sr-only">{common("actions")}</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && !data
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="p-3"><Skeleton className="h-8 rounded-none" /></td></tr>
                ))
              : !data?.length
                ? <EmptyRow colSpan={7}>{t("noDiscounts")}</EmptyRow>
                : data.map((d) => {
                    const expired = !!d.expiresAt && new Date(d.expiresAt) < new Date();
                    return (
                      <tr key={d.id} className="hover:bg-card">
                        <td className={tdCls}><span className="font-mono tracking-wider">{d.code}</span></td>
                        <td className={cn(tdCls, "tabular-nums")}>{d.type === "percent" ? `${d.value}%` : aed(d.value)}</td>
                        <td className={cn(tdCls, "tabular-nums text-muted-foreground")}>{d.minSubtotalAed ? aed(d.minSubtotalAed) : "—"}</td>
                        <td className={cn(tdCls, "whitespace-nowrap", expired ? "text-red-800" : "text-muted-foreground")}>{d.expiresAt ? fmt(d.expiresAt) : t("never")}</td>
                        <td className={cn(tdCls, "text-end tabular-nums")}>{d.usageCount}</td>
                        <td className={tdCls}>
                          <Switch checked={d.active} onCheckedChange={() => toggle(d)} aria-label={`${t("active")} ${d.code}`} />
                        </td>
                        <td className={cn(tdCls, "text-end")}>
                          <div className="inline-flex gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => openForm(d)} aria-label={`${common("edit")} ${d.code}`}><Pencil /></Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => remove(d)} aria-label={`${common("delete")} ${d.code}`}><Trash2 /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">{editing ? t("editDiscount") : t("newDiscount")}</DialogTitle>
            <DialogDescription className="sr-only">{t("discounts")}</DialogDescription>
          </DialogHeader>
          <form id="discount-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dc-code">{t("code")}</Label>
              <Input id="dc-code" dir="ltr" className={cn(fieldCls, "font-mono uppercase tracking-wider")} aria-invalid={!!errors.code} {...form.register("code")} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message === "taken" ? `${form.getValues("code").toUpperCase()} ✕` : "A–Z, 0–9 (3–24)"}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dc-type">{t("type")}</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} dir={locale === "ar" ? "rtl" : "ltr"}>
                    <SelectTrigger id="dc-type" className="h-11! w-full rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="percent">{t("percent")}</SelectItem>
                      <SelectItem value="fixed">{t("fixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dc-value">{t("value")} {type === "percent" ? "(%)" : "(AED)"}</Label>
              <Input id="dc-value" type="number" min={1} className={fieldCls} aria-invalid={!!errors.value} {...form.register("value", { valueAsNumber: true })} />
              {errors.value && <p className="text-xs text-destructive">{v("number")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dc-min">{t("minSubtotal")}</Label>
              <Input id="dc-min" type="number" min={0} className={fieldCls} {...form.register("minSubtotalAed", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dc-exp">{t("expires")}</Label>
              <Input id="dc-exp" type="date" className={fieldCls} {...form.register("expiresAt")} />
            </div>
            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <label className="flex cursor-pointer items-center justify-between gap-4 text-sm sm:col-span-2">
                  {t("active")}
                  <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                </label>
              )}
            />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{common("cancel")}</Button>
            <Button type="submit" form="discount-form" disabled={form.formState.isSubmitting}>{common("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
