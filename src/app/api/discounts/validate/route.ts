import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { evaluateDiscount } from "@/lib/pricing";
import { SEED_DISCOUNTS } from "@/lib/data/seed-extra";
import { getServiceSupabase } from "@/lib/supabase/clients";
import { rowToDiscount } from "@/lib/supabase/mappers";

const schema = z.object({ code: z.string().trim().min(1).max(40), subtotalAed: z.number().min(0) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, reason: "invalid" });
  const { code, subtotalAed } = parsed.data;
  if (isDemoMode) return NextResponse.json(evaluateDiscount(code, subtotalAed, SEED_DISCOUNTS));
  const { data } = await getServiceSupabase().from("discount_codes").select("*").ilike("code", code);
  return NextResponse.json(evaluateDiscount(code, subtotalAed, (data ?? []).map(rowToDiscount)));
}
