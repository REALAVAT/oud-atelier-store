import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/clients";

const schema = z.object({ email: z.email().max(200), locale: z.enum(["en", "ar"]).default("en") });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });
  if (!isDemoMode && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await getServiceSupabase()
      .from("newsletter_subscribers")
      .upsert({ email: parsed.data.email.toLowerCase(), locale: parsed.data.locale }, { onConflict: "email", ignoreDuplicates: true });
  }
  return NextResponse.json({ ok: true, code: "WELCOME10" });
}
