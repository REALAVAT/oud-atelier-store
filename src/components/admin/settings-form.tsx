"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { repo, useRepoQuery } from "@/lib/repo";
import { revalidateStorefront } from "@/lib/admin-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, Panel, fieldCls } from "./admin-ui";

const money = z.number().min(0);
const schema = z.object({
  storeName: z.string().trim().min(2),
  supportEmail: z.email(),
  whatsapp: z.string().trim().regex(/^\d{8,15}$/),
  freeShippingThresholdAed: money,
  standardShippingAed: money,
  expressShippingAed: money,
  sameDayShippingAed: money,
  giftWrapAed: money,
  lowStockThreshold: z.number().int().min(0).max(100),
  announcement: z.object({ en: z.string().trim().max(120), ar: z.string().trim().max(120) }),
});
type Values = z.infer<typeof schema>;

export function SettingsForm() {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const v = useTranslations("validation");
  const { data } = useRepoQuery(() => repo.getSettings());
  const form = useForm<Values>({ resolver: zodResolver(schema) });
  const errors = form.formState.errors;

  useEffect(() => {
    if (data) form.reset(data);
  }, [data, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    await repo.saveSettings({ ...data!, ...values });
    toast.success(t("settingsSaved"));
    revalidateStorefront();
  });

  if (!data) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 rounded-none" />
      </div>
    );
  }

  const num = (name: keyof Values, label: string) => (
    <div className="space-y-2">
      <Label htmlFor={`st-${name}`}>{label}</Label>
      <Input id={`st-${name}`} type="number" min={0} className={fieldCls} aria-invalid={!!errors[name]} {...form.register(name, { valueAsNumber: true })} />
      {errors[name] && <p className="text-xs text-destructive">{v("number")}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl">
      <PageHeader
        title={t("storeSettings")}
        actions={
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
            {form.formState.isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
            {common("save")}
          </Button>
        }
      />
      <div className="space-y-6">
        <Panel title={t("general")}>
          <div className="grid gap-5 p-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="st-name">{t("storeName")}</Label>
              <Input id="st-name" className={fieldCls} aria-invalid={!!errors.storeName} {...form.register("storeName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-email">{t("supportEmail")}</Label>
              <Input id="st-email" type="email" dir="ltr" className={fieldCls} aria-invalid={!!errors.supportEmail} {...form.register("supportEmail")} />
              {errors.supportEmail && <p className="text-xs text-destructive">{v("email")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-wa">{t("whatsapp")}</Label>
              <Input id="st-wa" dir="ltr" inputMode="numeric" placeholder="971500000000" className={fieldCls} aria-invalid={!!errors.whatsapp} {...form.register("whatsapp")} />
              {errors.whatsapp && <p className="text-xs text-destructive">{v("phone")}</p>}
            </div>
          </div>
        </Panel>
        <Panel title={t("shipping")}>
          <div className="grid gap-5 p-5 sm:grid-cols-3">
            {num("freeShippingThresholdAed", t("freeShipping"))}
            {num("standardShippingAed", t("standardShipping"))}
            {num("expressShippingAed", t("expressShipping"))}
            {num("sameDayShippingAed", t("sameDayShipping"))}
            {num("giftWrapAed", t("giftWrap"))}
            {num("lowStockThreshold", t("lowStockThreshold"))}
          </div>
        </Panel>
        <Panel title={t("announcement")}>
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="st-ann-en">{t("english")}</Label>
              <Input id="st-ann-en" className={fieldCls} {...form.register("announcement.en")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="st-ann-ar">{t("arabic")}</Label>
              <Input id="st-ann-ar" dir="rtl" lang="ar" className={fieldCls} {...form.register("announcement.ar")} />
            </div>
          </div>
        </Panel>
      </div>
    </form>
  );
}
