import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isDemoMode } from "@/lib/env";
import { getServerSupabase } from "@/lib/supabase/server";

/** Called by the admin after catalog or settings changes so static pages pick them up. */
export async function POST() {
  if (isDemoMode) return NextResponse.json({ ok: true });
  const sb = await getServerSupabase();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data } = await sb.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  if (data?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
