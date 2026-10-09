import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/clients";
import { rowToOrder } from "@/lib/supabase/mappers";
import { ORDER_SELECT } from "@/lib/server/orders";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  if (isDemoMode) return NextResponse.json({ error: "demo" }, { status: 400 });
  const url = new URL(req.url);
  const number = url.searchParams.get("number") ?? "";
  const token = url.searchParams.get("token") ?? "";
  if (!/^OA-\d+$/.test(number) || !UUID.test(token)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const { data } = await getServiceSupabase()
    .from("orders")
    .select(ORDER_SELECT)
    .eq("number", number)
    .eq("access_token", token)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ order: rowToOrder(data) }, { headers: { "cache-control": "no-store" } });
}
