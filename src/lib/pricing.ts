import type { DiscountCode, ShippingMethod, StoreSettings } from "@/lib/types";

export type PricingLine = { priceAed: number; quantity: number };

export type DiscountResult =
  | { ok: true; amountAed: number; code: DiscountCode }
  | { ok: false; reason: "invalid" | "inactive" | "expired" | "minimum"; minSubtotalAed?: number };

export function evaluateDiscount(
  code: string,
  subtotalAed: number,
  codes: DiscountCode[],
  now = new Date(),
): DiscountResult {
  const found = codes.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
  if (!found) return { ok: false, reason: "invalid" };
  if (!found.active) return { ok: false, reason: "inactive" };
  if (found.expiresAt && new Date(found.expiresAt) < now) return { ok: false, reason: "expired" };
  if (found.minSubtotalAed && subtotalAed < found.minSubtotalAed) {
    return { ok: false, reason: "minimum", minSubtotalAed: found.minSubtotalAed };
  }
  const amount =
    found.type === "percent"
      ? Math.round((subtotalAed * found.value) / 100)
      : Math.min(found.value, subtotalAed);
  return { ok: true, amountAed: amount, code: found };
}

export function shippingCost(
  method: ShippingMethod,
  subtotalAfterDiscountAed: number,
  settings: StoreSettings,
) {
  if (method === "standard") {
    return subtotalAfterDiscountAed >= settings.freeShippingThresholdAed ? 0 : settings.standardShippingAed;
  }
  if (method === "express") return settings.expressShippingAed;
  return settings.sameDayShippingAed;
}

export function computeTotals(opts: {
  lines: PricingLine[];
  discountAed?: number;
  shippingMethod?: ShippingMethod;
  giftWrap?: boolean;
  settings: StoreSettings;
}) {
  const subtotalAed = opts.lines.reduce((s, l) => s + l.priceAed * l.quantity, 0);
  const discountAed = Math.min(opts.discountAed ?? 0, subtotalAed);
  const afterDiscount = subtotalAed - discountAed;
  const shippingAed =
    opts.lines.length === 0 ? 0 : shippingCost(opts.shippingMethod ?? "standard", afterDiscount, opts.settings);
  const giftWrapAed = opts.giftWrap ? opts.settings.giftWrapAed : 0;
  return {
    subtotalAed,
    discountAed,
    shippingAed,
    giftWrapAed,
    totalAed: afterDiscount + shippingAed + giftWrapAed,
  };
}
