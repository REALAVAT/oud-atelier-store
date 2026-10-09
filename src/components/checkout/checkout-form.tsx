"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { isDemoMode } from "@/lib/env";
import { useSession } from "@/lib/session";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { repo, useRepoQuery } from "@/lib/repo";
import { localized } from "@/lib/data/seed-products";
import { checkoutSchema, EMIRATES, SHIPPING_METHODS, type CheckoutValues } from "@/lib/checkout-schema";
import { buildDemoOrder, saveDraft } from "@/lib/checkout-client";
import { shippingCost } from "@/lib/pricing";
import type { Address, ShippingMethod } from "@/lib/types";
import { PromoCodeForm, TotalsRows, GiftWrapOption } from "@/components/store/cart-parts";
import { useMoney } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SAME_DAY_EMIRATES = ["dubai", "sharjah"];

function Field({
  id,
  label,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = "h-12 rounded-none bg-card px-4 text-base md:text-sm";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const cartT = useTranslations("cart");
  const v = useTranslations("validation");
  const em = useTranslations("emirates");
  const locale = useLocale() as "en" | "ar";
  const router = useRouter();
  const money = useMoney();
  const hydrated = useHydrated();
  const { user, ready } = useSession();
  const giftWrap = useCart((s) => s.giftWrap);
  const giftMessage = useCart((s) => s.giftMessage);
  const [submitting, setSubmitting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      shippingMethod: "standard",
      saveAddress: true,
      address: { fullName: "", phone: "", area: "", street: "", building: "", notes: "" },
    },
  });
  const { register, control, formState, setValue } = form;
  const errors = formState.errors;
  const method = useWatch({ control, name: "shippingMethod" }) as ShippingMethod;
  const emirate = useWatch({ control, name: "address.emirate" });
  const totals = useCartTotals(method);

  const { data: saved } = useRepoQuery(() => repo.listAddresses(user!.id), [user?.id], !!user);

  useEffect(() => {
    if (user && !form.getValues("email")) setValue("email", user.email);
  }, [user, form, setValue]);

  const applyAddress = (a: Address) => {
    setValue("address", { fullName: a.fullName, phone: a.phone, emirate: a.emirate, area: a.area, street: a.street, building: a.building, notes: a.notes ?? "" }, { shouldValidate: true });
  };

  useEffect(() => {
    const def = saved?.find((a) => a.isDefault) ?? saved?.[0];
    if (def && !form.getValues("address.fullName")) applyAddress(def);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  useEffect(() => {
    if (emirate && method === "same-day" && !SAME_DAY_EMIRATES.includes(emirate)) setValue("shippingMethod", "standard");
  }, [emirate, method, setValue]);

  const err = (msg?: string) => (msg ? v(msg as "required") : undefined);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!totals.items.length) return;
    setSubmitting(true);
    try {
      if (isDemoMode) {
        const order = buildDemoOrder({
          items: totals.items,
          email: values.email,
          address: values.address,
          shippingMethod: values.shippingMethod,
          totals,
          discountCode: totals.discount?.code ?? null,
          giftWrap,
          giftMessage,
          userId: user?.id ?? null,
          locale,
        });
        saveDraft({ order, saveAddress: !!(user && values.saveAddress) });
        router.push("/checkout/pay");
        return;
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          saveAddress: !!(user && values.saveAddress),
          locale,
          items: totals.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          discountCode: totals.discount?.code ?? null,
          giftWrap,
          giftMessage,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "checkout");
      window.location.assign(data.url);
    } catch {
      toast.error(t("error"));
      setSubmitting(false);
    }
  }, () => {
    document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
  });

  if (!hydrated) {
    return (
      <div className="grid gap-12 py-12 lg:grid-cols-[1fr_420px]" aria-busy="true">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-none" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-none" />
      </div>
    );
  }

  if (!totals.items.length) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <ShoppingBag className="size-8 text-gold-deep" strokeWidth={1.2} aria-hidden />
        <h1 className="font-display text-4xl">{t("emptyRedirect")}</h1>
        <Button asChild>
          <Link href="/shop">{cartT("emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  const methodPrice = (m: ShippingMethod) =>
    shippingCost(m, totals.subtotalAed - totals.discountAed, totals.settings);

  const summary = (
    <div className="space-y-6">
      <ul className="divide-y">
        {totals.items.map((i) => (
          <li key={i.variantId} className="flex items-center gap-4 py-3">
            <div className="relative h-20 w-16 shrink-0 bg-muted">
              <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
              <span className="absolute -end-2 -top-2 flex size-5 items-center justify-center rounded-full bg-foreground text-[0.65rem] text-background">
                {i.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base">{localized(i.name, locale)}</p>
              <p className="text-xs text-muted-foreground">{i.label ? localized(i.label, locale) : `${i.sizeMl} ml`}</p>
            </div>
            <span className="text-sm tabular-nums">{money(i.priceAed * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <PromoCodeForm />
      <TotalsRows shippingAed={totals.shippingAed} />
    </div>
  );

  return (
    <div className="py-8 lg:py-14">
      <h1 className="font-display text-5xl">{t("title")}</h1>

      <div className="mt-6 border lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between bg-card px-4 py-4 text-sm"
        >
          <span className="inline-flex items-center gap-2">
            {t("summary")}
            <ChevronDown className={cn("size-4 transition-transform", summaryOpen && "rotate-180")} aria-hidden />
          </span>
          <span className="font-medium tabular-nums">{money(totals.totalAed)}</span>
        </button>
        {summaryOpen && <div className="border-t p-4">{summary}</div>}
      </div>

      <div className="mt-8 grid gap-12 lg:mt-10 lg:grid-cols-[1fr_420px] lg:gap-16">
        <form onSubmit={onSubmit} noValidate className="space-y-12">
          <section aria-labelledby="co-contact" className="space-y-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="co-contact" className="font-display text-2xl">{t("contact")}</h2>
              {ready && !user && (
                <p className="text-sm text-muted-foreground">
                  {t("haveAccount")}{" "}
                  <Link href="/login?next=/checkout" className="text-foreground underline underline-offset-4">
                    {t("signIn")}
                  </Link>
                </p>
              )}
            </div>
            <Field id="email" label={t("email")} error={err(errors.email?.message)}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                className={inputCls}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : "email-note"}
                {...register("email")}
              />
            </Field>
            <p id="email-note" className="text-xs text-muted-foreground">
              {user ? t("signedInAs", { email: user.email }) : t("guestNote")}
            </p>
          </section>

          <section aria-labelledby="co-address" className="space-y-5">
            <h2 id="co-address" className="font-display text-2xl">{t("shippingAddress")}</h2>
            {!!saved?.length && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t("useSaved")}</p>
                <div className="flex flex-wrap gap-2">
                  {saved.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => applyAddress(a)}
                      className="border px-4 py-2 text-start text-xs transition-colors hover:border-foreground"
                    >
                      <span className="block font-medium">{a.label ?? a.fullName}</span>
                      <span className="text-muted-foreground">{a.area}, {em(a.emirate)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="fullName" label={t("fullName")} error={err(errors.address?.fullName?.message)}>
                <Input id="fullName" autoComplete="name" className={inputCls} aria-invalid={!!errors.address?.fullName} aria-describedby="fullName-error" {...register("address.fullName")} />
              </Field>
              <Field id="phone" label={t("phone")} error={err(errors.address?.phone?.message)}>
                <Input
                  id="phone"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder={t("phonePlaceholder")}
                  className={cn(inputCls, "rtl:text-right")}
                  aria-invalid={!!errors.address?.phone}
                  aria-describedby="phone-error"
                  {...register("address.phone")}
                />
              </Field>
              <Field id="emirate" label={t("emirate")} error={err(errors.address?.emirate?.message)}>
                <Controller
                  control={control}
                  name="address.emirate"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange} dir={locale === "ar" ? "rtl" : "ltr"}>
                      <SelectTrigger
                        id="emirate"
                        onBlur={field.onBlur}
                        aria-invalid={!!errors.address?.emirate}
                        className="h-12! w-full rounded-none bg-card px-4"
                      >
                        <SelectValue placeholder={t("emiratePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent position="popper" className="rounded-none">
                        {EMIRATES.map((e) => (
                          <SelectItem key={e} value={e}>
                            {em(e)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field id="area" label={t("area")} error={err(errors.address?.area?.message)}>
                <Input id="area" autoComplete="address-level2" className={inputCls} aria-invalid={!!errors.address?.area} aria-describedby="area-error" {...register("address.area")} />
              </Field>
              <Field id="street" label={t("street")} error={err(errors.address?.street?.message)}>
                <Input id="street" autoComplete="address-line1" className={inputCls} aria-invalid={!!errors.address?.street} aria-describedby="street-error" {...register("address.street")} />
              </Field>
              <Field id="building" label={t("building")} error={err(errors.address?.building?.message)}>
                <Input id="building" autoComplete="address-line2" className={inputCls} aria-invalid={!!errors.address?.building} aria-describedby="building-error" {...register("address.building")} />
              </Field>
              <Field id="notes" label={t("notes")} className="sm:col-span-2">
                <Textarea id="notes" className="min-h-20 rounded-none bg-card" {...register("address.notes")} />
              </Field>
            </div>
            {user && (
              <Controller
                control={control}
                name="saveAddress"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <Checkbox checked={!!field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    {t("saveAddress")}
                  </label>
                )}
              />
            )}
          </section>

          <section aria-labelledby="co-shipping" className="space-y-5">
            <h2 id="co-shipping" className="font-display text-2xl">{t("shippingMethod")}</h2>
            <Controller
              control={control}
              name="shippingMethod"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} aria-labelledby="co-shipping" className="gap-0 border">
                  {SHIPPING_METHODS.map((m, idx) => {
                    const disabled = m === "same-day" && !!emirate && !SAME_DAY_EMIRATES.includes(emirate);
                    const price = methodPrice(m);
                    const key = m === "same-day" ? "sameDay" : m;
                    return (
                      <label
                        key={m}
                        htmlFor={`ship-${m}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors",
                          idx > 0 && "border-t",
                          field.value === m && "bg-card",
                          disabled && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <RadioGroupItem id={`ship-${m}`} value={m} disabled={disabled} />
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{t(key)}</span>
                          <span className="block text-xs text-muted-foreground">{t(`${key}Desc`)}</span>
                        </span>
                        <span className="text-sm tabular-nums">{price === 0 ? cartT("free") : money(price)}</span>
                      </label>
                    );
                  })}
                </RadioGroup>
              )}
            />
            <GiftWrapOption />
          </section>

          <section aria-labelledby="co-payment" className="space-y-4">
            <h2 id="co-payment" className="font-display text-2xl">{t("payment")}</h2>
            <p className="border border-dashed border-gold/60 bg-card p-4 text-sm text-muted-foreground">
              {isDemoMode ? t("paymentDemo") : t("paymentStripe")}
            </p>
            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              <Lock aria-hidden />
              {submitting ? t("processing") : t("placeOrder", { amount: money(totals.totalAed) })}
            </Button>
            <p className="text-center text-xs text-muted-foreground">{t("secure")}</p>
          </section>
        </form>

        <aside className="hidden h-fit border bg-card p-8 lg:sticky lg:top-28 lg:block" aria-label={t("summary")}>
          <h2 className="mb-4 font-display text-2xl">{t("summary")}</h2>
          {summary}
        </aside>
      </div>
    </div>
  );
}
