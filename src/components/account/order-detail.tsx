"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import { useSession } from "@/lib/session";
import { localized } from "@/lib/data/seed-products";
import { useMoney } from "@/components/store/price";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTimeline, StatusBadge, useDateFormat } from "./order-status";

export function OrderDetail({ id }: { id: string }) {
  const t = useTranslations("account");
  const cart = useTranslations("cart");
  const em = useTranslations("emirates");
  const ship = useTranslations("shippingMethods");
  const locale = useLocale();
  const money = useMoney();
  const fmt = useDateFormat();
  const { user } = useSession();
  const { data: order, loading } = useRepoQuery(() => repo.getOrder(id), [id]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-80 rounded-none" />
      </div>
    );
  }

  const owns = order && user && (order.userId === user.id || order.email.toLowerCase() === user.email.toLowerCase() || user.role === "admin");
  if (!order || !owns) {
    return (
      <div className="border border-dashed p-12 text-center">
        <p className="font-display text-2xl">{t("noOrders")}</p>
        <Link href="/account/orders" className="link-underline mt-4 inline-block text-sm">{t("backToOrders")}</Link>
      </div>
    );
  }

  const a = order.address;
  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t("backToOrders")}
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <h2 className="font-display text-4xl">{t("order")} {order.number}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{t("placed", { date: fmt(order.createdAt, true) })}</p>

      <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section className="border bg-card" aria-labelledby="od-items">
            <h3 id="od-items" className="border-b px-6 py-4 font-display text-xl">{t("items")}</h3>
            <ul className="divide-y px-6">
              {order.items.map((i) => (
                <li key={i.variantId} className="flex items-center gap-4 py-4">
                  <Link href={`/products/${i.slug}`} className="relative h-20 w-16 shrink-0 bg-muted">
                    <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${i.slug}`} className="font-display text-lg hover:text-gold-deep">{localized(i.name, locale)}</Link>
                    <p className="text-xs text-muted-foreground">{i.sizeMl} ml · ×{i.quantity}</p>
                  </div>
                  <span className="text-sm tabular-nums">{money(i.priceAed * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t px-6 py-5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{cart("subtotal")}</dt><dd className="tabular-nums">{money(order.subtotalAed)}</dd></div>
              {order.discountAed > 0 && <div className="flex justify-between text-gold-deep"><dt>{cart("discount")} ({order.discountCode})</dt><dd className="tabular-nums">−{money(order.discountAed)}</dd></div>}
              {order.giftWrapAed > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">{cart("giftWrap")}</dt><dd className="tabular-nums">{money(order.giftWrapAed)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">{cart("shipping")}</dt><dd className="tabular-nums">{order.shippingAed === 0 ? cart("free") : money(order.shippingAed)}</dd></div>
              <div className="flex justify-between border-t pt-3 text-base font-medium"><dt>{cart("total")}</dt><dd className="tabular-nums">{money(order.totalAed)}</dd></div>
            </dl>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="border p-6" aria-labelledby="od-address">
              <h3 id="od-address" className="eyebrow">{t("deliveryAddress")}</h3>
              <p className="mt-3 text-sm leading-relaxed">
                {a.fullName}<br />{a.building}, {a.street}<br />{a.area}, {em(a.emirate)}<br />
                <span dir="ltr">{a.phone}</span>
              </p>
            </section>
            <section className="border p-6" aria-labelledby="od-ship">
              <h3 id="od-ship" className="eyebrow">{t("shippingMethod")}</h3>
              <p className="mt-3 text-sm">{ship(order.shippingMethod)}</p>
              <h3 className="eyebrow mt-5">{t("payment")}</h3>
              <p className="mt-3 text-sm">{order.paymentMethod === "stripe" ? "Stripe" : "Demo card •••• 4242"}</p>
              {order.giftWrap && (
                <p className="mt-5 inline-flex items-start gap-2 text-sm text-muted-foreground">
                  <Gift className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
                  <span>{t("giftNote")}{order.giftMessage ? ` — “${order.giftMessage}”` : ""}</span>
                </p>
              )}
            </section>
          </div>
        </div>

        <section className="h-fit border bg-card p-6" aria-labelledby="od-timeline">
          <h3 id="od-timeline" className="mb-6 font-display text-xl">{t("timeline")}</h3>
          <OrderTimeline order={order} />
        </section>
      </div>
    </div>
  );
}
