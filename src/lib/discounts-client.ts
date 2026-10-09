"use client";

import { isDemoMode } from "@/lib/env";
import { evaluateDiscount, type DiscountResult } from "@/lib/pricing";
import { useDemoDb } from "@/stores/demo-db";

export async function validateDiscount(code: string, subtotalAed: number): Promise<DiscountResult> {
  if (isDemoMode) return evaluateDiscount(code, subtotalAed, useDemoDb.getState().discounts);
  const res = await fetch("/api/discounts/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, subtotalAed }),
  });
  if (!res.ok) return { ok: false, reason: "invalid" };
  return (await res.json()) as DiscountResult;
}
