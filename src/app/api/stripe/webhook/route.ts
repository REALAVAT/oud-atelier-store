import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, markOrderPaid } from "@/lib/server/orders";
import { getServiceSupabase } from "@/lib/supabase/clients";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (orderId && session.payment_status === "paid") {
      await markOrderPaid(orderId, `Stripe ${session.payment_intent ?? session.id}`);
    }
  }

  if (event.type === "checkout.session.expired") {
    const orderId = event.data.object.metadata?.order_id;
    if (orderId) {
      const sb = getServiceSupabase();
      const { data } = await sb
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (data) await sb.from("order_status_events").insert({ order_id: orderId, status: "cancelled", note: "Checkout expired" });
    }
  }

  return NextResponse.json({ received: true });
}
