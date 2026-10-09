"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Gift, Minus, Plus, Tag, Truck, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { useCart, type CartItem } from "@/stores/cart";
import { localized } from "@/lib/data/seed-products";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { validateDiscount } from "@/lib/discounts-client";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Price, useMoney } from "./price";
import { cn } from "@/lib/utils";

export function CartLine({ item, compact, onNavigate }: { item: CartItem; compact?: boolean; onNavigate?: () => void }) {
  const t = useTranslations("cart");
  const p = useTranslations("product");
  const s = useTranslations("shop");
  const locale = useLocale();
  const setQuantity = useCart((st) => st.setQuantity);
  const remove = useCart((st) => st.remove);
  const name = localized(item.name, locale);
  const size = item.label ? localized(item.label, locale) : s("ml", { size: item.sizeMl });

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/products/${item.slug}`}
        onClick={onNavigate}
        className={cn("relative shrink-0 overflow-hidden bg-muted", compact ? "h-24 w-20" : "h-32 w-26")}
      >
        <Image src={item.image} alt={name} fill sizes="104px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/products/${item.slug}`} onClick={onNavigate} className="font-display text-lg leading-tight hover:text-gold-deep">
              {name}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">{size}</p>
          </div>
          <Price aed={item.priceAed * item.quantity} className="text-sm" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex h-9 items-center border border-input">
            <button
              type="button"
              className="inline-flex h-full w-9 items-center justify-center hover:bg-muted"
              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
              aria-label={p("decrease")}
            >
              <Minus className="size-3" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums">{item.quantity}</span>
            <button
              type="button"
              className="inline-flex h-full w-9 items-center justify-center hover:bg-muted disabled:opacity-40"
              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
              disabled={item.quantity >= item.maxStock}
              aria-label={p("increase")}
            >
              <Plus className="size-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => remove(item.variantId)}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("remove")}
          </button>
        </div>
      </div>
    </li>
  );
}

export function FreeShippingBar() {
  const t = useTranslations("cart");
  const money = useMoney();
  const { remainingForFree, freeProgress } = useCartTotals();
  return (
    <div className="space-y-2.5">
      <p className="flex items-center gap-2 text-xs">
        <Truck className="size-4 text-gold-deep" aria-hidden />
        {remainingForFree > 0
          ? t("freeShippingProgress", { amount: money(remainingForFree) })
          : t("freeShippingUnlocked")}
      </p>
      <div
        className="h-[3px] w-full overflow-hidden bg-border"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(freeProgress * 100)}
        aria-label={t("freeShippingUnlocked")}
      >
        <div
          className="h-full bg-gold transition-[width] duration-700 ease-[var(--ease-luxe)]"
          style={{ width: `${freeProgress * 100}%` }}
        />
      </div>
    </div>
  );
}

export function PromoCodeForm() {
  const t = useTranslations("cart");
  const money = useMoney();
  const id = useId();
  const setDiscount = useCart((s) => s.setDiscount);
  const { discount, subtotalAed } = useCartTotals();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    const res = await validateDiscount(code, subtotalAed);
    setLoading(false);
    if (res.ok) {
      setDiscount(res.code);
      setError(null);
      setCode("");
      toast.success(t("promoApplied", { code: res.code.code }));
    } else {
      setError(
        res.reason === "minimum"
          ? t("promoMinimum", { amount: money(res.minSubtotalAed ?? 0) })
          : res.reason === "expired"
            ? t("promoExpired")
            : res.reason === "inactive"
              ? t("promoInactive")
              : t("promoInvalid"),
      );
    }
  }

  if (discount) {
    return (
      <div className="flex items-center justify-between border border-dashed border-gold px-3 py-2.5 text-sm">
        <span className="inline-flex items-center gap-2">
          <Tag className="size-4 text-gold-deep" aria-hidden />
          <span className="font-mono tracking-widest">{discount.code}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setDiscount(null);
            toast(t("promoRemoved"));
          }}
          aria-label={t("remove")}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} noValidate>
      <label htmlFor={id} className="text-xs font-medium uppercase tracking-[0.18em] rtl:tracking-normal">
        {t("promo")}
      </label>
      <div className="mt-2 flex">
        <input
          id={id}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t("promoPlaceholder")}
          aria-invalid={!!error}
          aria-describedby={`${id}-hint`}
          className="h-11 min-w-0 flex-1 border border-input bg-transparent px-3 font-mono text-sm tracking-wider uppercase outline-none placeholder:font-sans placeholder:tracking-normal placeholder:normal-case focus:border-foreground"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-11 border border-s-0 border-foreground bg-foreground px-5 text-xs font-medium uppercase tracking-[0.18em] text-background hover:bg-ink-soft disabled:opacity-60 rtl:tracking-normal"
        >
          {t("apply")}
        </button>
      </div>
      <p id={`${id}-hint`} className={cn("mt-1.5 text-xs", error ? "text-destructive" : "text-muted-foreground")}>
        {error ?? t("tryCode")}
      </p>
    </form>
  );
}

export function GiftWrapOption() {
  const t = useTranslations("cart");
  const money = useMoney();
  const id = useId();
  const giftWrap = useCart((s) => s.giftWrap);
  const setGiftWrap = useCart((s) => s.setGiftWrap);
  const giftMessage = useCart((s) => s.giftMessage);
  const setGiftMessage = useCart((s) => s.setGiftMessage);
  const { settings } = useCartTotals();
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <Checkbox id={id} checked={giftWrap} onCheckedChange={(v) => setGiftWrap(v === true)} className="mt-0.5" />
        <div className="flex-1">
          <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <Gift className="size-4 text-gold-deep" aria-hidden />
            {t("giftWrapLabel", { price: money(settings.giftWrapAed) })}
          </label>
          <p className="mt-1 text-xs text-muted-foreground">{t("giftWrapHint")}</p>
        </div>
      </div>
      {giftWrap && (
        <Textarea
          value={giftMessage}
          onChange={(e) => setGiftMessage(e.target.value.slice(0, 240))}
          placeholder={t("giftMessage")}
          aria-label={t("giftMessage")}
          className="mt-3 min-h-20 rounded-none bg-background"
        />
      )}
    </div>
  );
}

export function TotalsRows({
  shippingAed,
  showShipping = true,
}: {
  shippingAed?: number | null;
  showShipping?: boolean;
}) {
  const t = useTranslations("cart");
  const totals = useCartTotals();
  const money = useMoney();
  const shipping = shippingAed === undefined ? totals.shippingAed : shippingAed;
  const total = totals.totalAed - totals.shippingAed + (shipping ?? 0);
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{t("subtotal")}</dt>
        <dd className="tabular-nums">{money(totals.subtotalAed)}</dd>
      </div>
      {totals.discountAed > 0 && (
        <div className="flex justify-between text-gold-deep">
          <dt>
            {t("discount")} ({totals.discount?.code})
          </dt>
          <dd className="tabular-nums">−{money(totals.discountAed)}</dd>
        </div>
      )}
      {totals.giftWrapAed > 0 && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t("giftWrap")}</dt>
          <dd className="tabular-nums">{money(totals.giftWrapAed)}</dd>
        </div>
      )}
      {showShipping && (
        <div className="flex justify-between">
          <dt className="text-muted-foreground">{t("shipping")}</dt>
          <dd className="tabular-nums">
            {shipping === null ? t("shippingAtCheckout") : shipping === 0 ? t("free") : money(shipping)}
          </dd>
        </div>
      )}
      <div className="flex justify-between border-t pt-3 text-base">
        <dt className="font-medium">{t("total")}</dt>
        <dd className="font-medium tabular-nums">{money(shipping === null ? totals.totalAed - totals.shippingAed : total)}</dd>
      </div>
      <p className="text-xs text-muted-foreground">{t("taxes")}</p>
    </dl>
  );
}
