"use client";

import type { Order, OrderItem, ShippingMethod, Address } from "@/lib/types";
import type { CartItem } from "@/stores/cart";
import { useDemoDb } from "@/stores/demo-db";
import { orderConfirmationEmail } from "@/lib/email/order-confirmation";

const DRAFT_KEY = "oud-atelier-checkout-draft";

export type CheckoutDraft = {
  order: Order;
  saveAddress: boolean;
};

export function nextOrderNumber(orders: Order[]) {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.number.replace(/\D/g, "")) || 0), 1000);
  return `OA-${max + 1}`;
}

export function toOrderItems(items: CartItem[]): OrderItem[] {
  return items.map((i) => ({
    productId: i.productId,
    slug: i.slug,
    name: i.name,
    image: i.image,
    variantId: i.variantId,
    sizeMl: i.sizeMl,
    priceAed: i.priceAed,
    quantity: i.quantity,
  }));
}

export function buildDemoOrder(input: {
  items: CartItem[];
  email: string;
  address: Address;
  shippingMethod: ShippingMethod;
  totals: { subtotalAed: number; discountAed: number; shippingAed: number; giftWrapAed: number; totalAed: number };
  discountCode: string | null;
  giftWrap: boolean;
  giftMessage: string;
  userId: string | null;
  locale: "en" | "ar";
}): Order {
  const now = new Date().toISOString();
  return {
    id: `o_${Date.now().toString(36)}`,
    number: nextOrderNumber(useDemoDb.getState().orders),
    userId: input.userId,
    email: input.email.trim().toLowerCase(),
    customerName: input.address.fullName,
    items: toOrderItems(input.items),
    ...input.totals,
    discountCode: input.discountCode,
    giftWrap: input.giftWrap,
    giftMessage: input.giftWrap ? input.giftMessage || undefined : undefined,
    shippingMethod: input.shippingMethod,
    address: input.address,
    status: "pending",
    timeline: [{ status: "pending", at: now }],
    paymentMethod: "demo",
    locale: input.locale,
    createdAt: now,
  };
}

export function saveDraft(draft: CheckoutDraft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function readDraft(): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

/** Completes a simulated payment: records the order, updates stock/discounts and logs the email. */
export function completeDemoOrder(draft: CheckoutDraft): Order {
  const db = useDemoDb.getState();
  const paidAt = new Date().toISOString();
  const order: Order = {
    ...draft.order,
    number: nextOrderNumber(db.orders),
    status: "paid",
    timeline: [...draft.order.timeline, { status: "paid", at: paidAt }],
  };
  db.createOrder(order);
  if (order.discountCode) db.incrementDiscount(order.discountCode);
  if (draft.saveAddress && order.userId) db.saveAddress(order.userId, { ...order.address, label: "Home" });
  const { subject, html } = orderConfirmationEmail(order, window.location.origin);
  db.logEmail({ id: `e_${Date.now()}`, to: order.email, subject, html, sentAt: paidAt, delivered: false });
  return order;
}
