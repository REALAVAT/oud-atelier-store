import "server-only";
import Stripe from "stripe";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase/clients";
import { rowToOrder } from "@/lib/supabase/mappers";
import { orderConfirmationEmail } from "@/lib/email/order-confirmation";
import { getSiteUrl, isResendEnabled } from "@/lib/env";
import type { Order } from "@/lib/types";

export const ORDER_SELECT = "*, order_status_events(*)";

let stripe: Stripe | null = null;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!stripe) stripe = new Stripe(key);
  return stripe;
}

export async function sendOrderConfirmation(order: Order) {
  if (!isResendEnabled()) return false;
  const { subject, html } = orderConfirmationEmail(order, getSiteUrl());
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Oud Atelier <onboarding@resend.dev>",
    to: order.email,
    subject,
    html,
  });
  return !error;
}

/** Idempotently moves a pending order to paid, applies stock + discount usage and emails the customer. */
export async function markOrderPaid(orderId: string, note?: string) {
  const sb = getServiceSupabase();
  const { data: updated } = await sb
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (!updated) return null;

  await sb.from("order_status_events").insert({ order_id: orderId, status: "paid", note: note ?? null });
  await sb.rpc("apply_order_inventory", { p_order_id: orderId });

  const { data } = await sb.from("orders").select(ORDER_SELECT).eq("id", orderId).single();
  const order = rowToOrder(data);
  try {
    await sendOrderConfirmation(order);
  } catch (e) {
    console.error("order email failed", e);
  }
  return order;
}
