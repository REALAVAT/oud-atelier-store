"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { isDemoMode } from "@/lib/env";
import { useDemoDb } from "@/stores/demo-db";
import { useCart } from "@/stores/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSession } from "@/lib/session";
import { localized } from "@/lib/data/seed-products";
import type { Order } from "@/lib/types";
import { useMoney } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function estimate(order: Order, locale: string) {
  const days = order.shippingMethod === "same-day" ? 0 : order.shippingMethod === "express" ? 1 : 2;
  const d = new Date(order.createdAt);
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

export function OrderSuccess() {
  const t = useTranslations("success");
  const cartT = useTranslations("cart");
  const em = useTranslations("emirates");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const money = useMoney();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const { user } = useSession();
  const clearCart = useCart((s) => s.clear);
  const number = params.get("order") ?? "";
  const token = params.get("token") ?? "";
  const demoOrder = useDemoDb((s) => s.orders.find((o) => o.number === number));
  const [liveOrder, setLiveOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    if (isDemoMode || !number) return;
    clearCart();
    fetch(`/api/orders/lookup?number=${encodeURIComponent(number)}&token=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { order?: Order } | null) => setLiveOrder(d?.order ?? null))
      .catch(() => setLiveOrder(null));
  }, [number, token, clearCart]);

  const order = isDemoMode ? (hydrated ? demoOrder ?? null : undefined) : liveOrder;

  if (order === undefined) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-20" aria-busy="true">
        <Skeleton className="mx-auto size-16 rounded-full" />
        <Skeleton className="mx-auto h-12 w-2/3" />
        <Skeleton className="h-64 rounded-none" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 py-20 text-center">
        <h1 className="font-display text-4xl">{t("notFound")}</h1>
        <Button asChild>
          <Link href="/shop">{t("continue")}</Link>
        </Button>
      </div>
    );
  }

  const a = order.address;
  return (
    <div className="mx-auto max-w-2xl py-14 lg:py-24">
      <div className="text-center">
        <motion.span
          initial={reduce ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold"
        >
          <Check className="size-7 text-gold-deep" strokeWidth={1.4} aria-hidden />
        </motion.span>
        <p className="eyebrow mt-8">{t("eyebrow")}</p>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t("title", { name: order.customerName.split(" ")[0] ?? "" })}</h1>
        <p className="mx-auto mt-5 max-w-md text-muted-foreground">{t("body", { number: order.number })}</p>
        <p className="mx-auto mt-6 inline-flex max-w-md items-start gap-2 border border-dashed border-gold/60 bg-card px-4 py-3 text-start text-xs text-muted-foreground">
          <Mail className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
          {isDemoMode ? t("emailLogged", { email: order.email }) : t("emailSent", { email: order.email })}
        </p>
      </div>

      <div className="mt-12 border bg-card">
        <div className="grid gap-6 border-b p-6 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow">{t("estimated")}</p>
            <p className="mt-2 font-display text-xl">{estimate(order, locale)}</p>
          </div>
          <div>
            <p className="eyebrow">{t("deliverTo")}</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              {a.fullName}
              <br />
              {a.building}, {a.street}
              <br />
              {a.area}, {em(a.emirate)}
            </p>
          </div>
        </div>
        <ul className="divide-y px-6">
          {order.items.map((i) => (
            <li key={i.variantId} className="flex items-center gap-4 py-4">
              <div className="relative h-16 w-13 shrink-0 bg-muted">
                <Image src={i.image} alt="" fill sizes="52px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base">{localized(i.name, locale)}</p>
                <p className="text-xs text-muted-foreground">{i.sizeMl} ml · ×{i.quantity}</p>
              </div>
              <span className="text-sm tabular-nums">{money(i.priceAed * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t p-6 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">{cartT("subtotal")}</dt><dd className="tabular-nums">{money(order.subtotalAed)}</dd></div>
          {order.discountAed > 0 && (
            <div className="flex justify-between text-gold-deep"><dt>{cartT("discount")} ({order.discountCode})</dt><dd className="tabular-nums">−{money(order.discountAed)}</dd></div>
          )}
          {order.giftWrapAed > 0 && (
            <div className="flex justify-between"><dt className="text-muted-foreground">{cartT("giftWrap")}</dt><dd className="tabular-nums">{money(order.giftWrapAed)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted-foreground">{cartT("shipping")}</dt><dd className="tabular-nums">{order.shippingAed === 0 ? cartT("free") : money(order.shippingAed)}</dd></div>
          <div className="flex justify-between border-t pt-3 text-base font-medium"><dt>{cartT("total")}</dt><dd className="tabular-nums">{money(order.totalAed)}</dd></div>
        </dl>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {user && (
          <Button asChild>
            <Link href={`/account/orders/${order.id}`}>{t("track")}</Link>
          </Button>
        )}
        <Button asChild variant={user ? "outline" : "default"}>
          <Link href="/shop">{t("continue")}</Link>
        </Button>
      </div>
    </div>
  );
}
