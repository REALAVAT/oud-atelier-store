"use client";

import { useMemo } from "react";
import { useCart } from "@/stores/cart";
import { useCatalog } from "@/components/providers/catalog-provider";
import { computeTotals, evaluateDiscount } from "@/lib/pricing";
import { useHydrated } from "@/hooks/use-hydrated";
import type { ShippingMethod } from "@/lib/types";

export function useCartTotals(shippingMethod: ShippingMethod = "standard") {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const discount = useCart((s) => s.discount);
  const giftWrap = useCart((s) => s.giftWrap);
  const { settings } = useCatalog();

  return useMemo(() => {
    const lines = hydrated ? items : [];
    const subtotal = lines.reduce((s, l) => s + l.priceAed * l.quantity, 0);
    const evaluated = discount ? evaluateDiscount(discount.code, subtotal, [discount]) : null;
    const totals = computeTotals({
      lines,
      discountAed: evaluated?.ok ? evaluated.amountAed : 0,
      shippingMethod,
      giftWrap: hydrated && giftWrap,
      settings,
    });
    const remainingForFree = Math.max(0, settings.freeShippingThresholdAed - (totals.subtotalAed - totals.discountAed));
    return {
      ...totals,
      items: lines,
      discount: evaluated?.ok ? discount : null,
      discountInvalid: evaluated && !evaluated.ok ? evaluated : null,
      remainingForFree,
      freeProgress: Math.min(1, (totals.subtotalAed - totals.discountAed) / settings.freeShippingThresholdAed),
      settings,
    };
  }, [hydrated, items, discount, giftWrap, shippingMethod, settings]);
}
