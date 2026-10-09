import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/lib/checkout-schema";
import { isDemoMode, isStripeEnabled } from "@/lib/env";
import { getServiceSupabase } from "@/lib/supabase/clients";
import { getServerSupabase } from "@/lib/supabase/server";
import { addressToRow, rowToDiscount, rowToSettings } from "@/lib/supabase/mappers";
import { SEED_SETTINGS } from "@/lib/data/seed-extra";
import { computeTotals, evaluateDiscount } from "@/lib/pricing";
import { getStripe, markOrderPaid } from "@/lib/server/orders";
import type { OrderItem } from "@/lib/types";

export async function POST(req: Request) {
  if (isDemoMode) return NextResponse.json({ error: "demo" }, { status: 400 });

  const parsed = checkoutRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const body = parsed.data;
  const sb = getServiceSupabase();

  const ids = body.items.map((i) => i.variantId);
  const { data: variants, error } = await sb
    .from("product_variants")
    .select("id, size_ml, price_aed, stock, product_id, products!inner(slug, name, images, status)")
    .in("id", ids);
  if (error || !variants || variants.length !== new Set(ids).size) {
    return NextResponse.json({ error: "unavailable" }, { status: 409 });
  }

  const items: OrderItem[] = [];
  for (const line of body.items) {
    const v = variants.find((x) => x.id === line.variantId);
    const p = v?.products as unknown as { slug: string; name: OrderItem["name"]; images: string[]; status: string } | undefined;
    if (!v || !p || p.status !== "active" || v.stock < line.quantity) {
      return NextResponse.json({ error: "stock" }, { status: 409 });
    }
    items.push({
      productId: v.product_id,
      slug: p.slug,
      name: p.name,
      image: p.images[0] ?? "",
      variantId: v.id,
      sizeMl: v.size_ml,
      priceAed: Number(v.price_aed),
      quantity: line.quantity,
    });
  }

  const { data: settingsRow } = await sb.from("store_settings").select("data").eq("id", 1).maybeSingle();
  const settings = rowToSettings(settingsRow, SEED_SETTINGS);
  const subtotal = items.reduce((s, i) => s + i.priceAed * i.quantity, 0);

  let discountAed = 0;
  let discountCode: string | null = null;
  if (body.discountCode) {
    const { data: codes } = await sb.from("discount_codes").select("*").ilike("code", body.discountCode);
    const result = evaluateDiscount(body.discountCode, subtotal, (codes ?? []).map(rowToDiscount));
    if (result.ok) {
      discountAed = result.amountAed;
      discountCode = result.code.code;
    }
  }

  const totals = computeTotals({
    lines: items,
    discountAed,
    shippingMethod: body.shippingMethod,
    giftWrap: body.giftWrap,
    settings,
  });

  const { data: auth } = await (await getServerSupabase()).auth.getUser();
  const userId = auth.user?.id ?? null;

  const { data: order, error: insertError } = await sb
    .from("orders")
    .insert({
      user_id: userId,
      email: body.email.toLowerCase(),
      customer_name: body.address.fullName,
      items,
      subtotal_aed: totals.subtotalAed,
      discount_aed: totals.discountAed,
      shipping_aed: totals.shippingAed,
      gift_wrap_aed: totals.giftWrapAed,
      total_aed: totals.totalAed,
      discount_code: discountCode,
      gift_wrap: body.giftWrap,
      gift_message: body.giftWrap ? body.giftMessage || null : null,
      shipping_method: body.shippingMethod,
      address: body.address,
      status: "pending",
      payment_method: isStripeEnabled() ? "stripe" : "demo",
      locale: body.locale,
    })
    .select("id, number, access_token")
    .single();
  if (insertError || !order) {
    console.error("order insert failed", insertError);
    return NextResponse.json({ error: "order" }, { status: 500 });
  }
  await sb.from("order_status_events").insert({ order_id: order.id, status: "pending" });
  if (userId && body.saveAddress) {
    await sb.from("addresses").insert(addressToRow({ ...body.address, label: "Home" }, userId));
  }

  const origin = new URL(req.url).origin;
  const successUrl = `${origin}/${body.locale}/checkout/success?order=${order.number}&token=${order.access_token}`;

  if (!isStripeEnabled()) {
    await markOrderPaid(order.id, "Paid without Stripe (test configuration)");
    return NextResponse.json({ url: successUrl });
  }

  const stripe = getStripe();
  const fils = (aed: number) => Math.round(aed * 100);
  const lineItems = items.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: "aed",
      unit_amount: fils(i.priceAed),
      product_data: { name: `${i.name.en} · ${i.sizeMl} ml`, images: i.image.startsWith("http") ? [i.image] : [] },
    },
  }));
  if (totals.giftWrapAed > 0) {
    lineItems.push({ quantity: 1, price_data: { currency: "aed", unit_amount: fils(totals.giftWrapAed), product_data: { name: "Gift wrapping", images: [] } } });
  }
  if (totals.shippingAed > 0) {
    lineItems.push({ quantity: 1, price_data: { currency: "aed", unit_amount: fils(totals.shippingAed), product_data: { name: `Delivery (${body.shippingMethod})`, images: [] } } });
  }

  let discounts: { coupon: string }[] | undefined;
  if (totals.discountAed > 0) {
    const coupon = await stripe.coupons.create({
      amount_off: fils(totals.discountAed),
      currency: "aed",
      duration: "once",
      name: discountCode ?? "Discount",
      max_redemptions: 1,
    });
    discounts = [{ coupon: coupon.id }];
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email,
    line_items: lineItems,
    discounts,
    locale: body.locale === "ar" ? "auto" : "en",
    metadata: { order_id: order.id, order_number: order.number },
    payment_intent_data: { metadata: { order_id: order.id } },
    success_url: successUrl,
    cancel_url: `${origin}/${body.locale}/checkout`,
  });
  await sb.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

  return NextResponse.json({ url: session.url });
}
