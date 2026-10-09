"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Gift, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import { localized } from "@/lib/data/seed-products";
import { ORDER_FLOW, type OrderStatus } from "@/lib/types";
import { OrderTimeline, StatusBadge, useDateFormat } from "@/components/account/order-status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Panel, useAed } from "./admin-ui";

export function OrderAdminDetail({ id }: { id: string }) {
  const t = useTranslations("admin");
  const st = useTranslations("status");
  const cart = useTranslations("cart");
  const em = useTranslations("emirates");
  const ship = useTranslations("shippingMethods");
  const common = useTranslations("common");
  const locale = useLocale();
  const aed = useAed();
  const fmt = useDateFormat();
  const { data: order, loading, refetch } = useRepoQuery(() => repo.getOrder(id), [id]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading && !order) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-96 rounded-none" />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="border border-dashed p-12 text-center">
        <p className="font-display text-2xl">{t("noOrders")}</p>
        <Link href="/admin/orders" className="link-underline mt-4 inline-block text-sm">{t("orders")}</Link>
      </div>
    );
  }

  const idx = ORDER_FLOW.indexOf(order.status);
  const next: OrderStatus | null =
    order.status === "pending" ? "paid" : idx >= 0 && idx < ORDER_FLOW.length - 1 ? ORDER_FLOW[idx + 1] : null;
  const canCancel = order.status !== "cancelled" && order.status !== "delivered" && order.status !== "shipped";

  const update = async (status: OrderStatus) => {
    setBusy(true);
    try {
      await repo.updateOrderStatus(order.id, status, note.trim() || undefined);
      toast.success(t("statusUpdated", { status: st(status) }));
      setNote("");
      refetch();
    } catch {
      toast.error(common("error"));
    } finally {
      setBusy(false);
    }
  };

  const a = order.address;
  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t("orders")}
      </Link>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-4xl">{t("orderDetail", { number: order.number })}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-muted-foreground">{fmt(order.createdAt, true)}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel title={t("changeStatus")}>
            <div className="space-y-4 p-5">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 200))}
                placeholder={t("statusNote")}
                aria-label={t("statusNote")}
                className="min-h-16 rounded-none bg-background"
              />
              <div className="flex flex-wrap gap-2">
                {next && (
                  <Button size="sm" onClick={() => update(next)} disabled={busy}>
                    {t("nextStep", { status: st(next) })} <ArrowRight className="rtl:rotate-180" aria-hidden />
                  </Button>
                )}
                {canCancel && (
                  <Button size="sm" variant="outline" onClick={() => update("cancelled")} disabled={busy}>
                    {t("cancelOrder")}
                  </Button>
                )}
                {!next && !canCancel && <p className="text-sm text-muted-foreground">{st(order.status)}</p>}
              </div>
              <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground" aria-label={t("timeline")}>
                {ORDER_FLOW.map((s, i) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className={i <= idx ? "font-medium text-foreground" : ""}>{st(s)}</span>
                    {i < ORDER_FLOW.length - 1 && <span aria-hidden>→</span>}
                  </li>
                ))}
              </ol>
            </div>
          </Panel>

          <Panel title={t("items")}>
            <ul className="divide-y px-5">
              {order.items.map((i) => (
                <li key={i.variantId} className="flex items-center gap-4 py-3">
                  <div className="relative h-14 w-11 shrink-0 bg-muted">
                    <Image src={i.image} alt="" fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{localized(i.name, locale)}</p>
                    <p className="text-xs text-muted-foreground">{i.sizeMl} ml · {aed(i.priceAed)} × {i.quantity}</p>
                  </div>
                  <span className="text-sm tabular-nums">{aed(i.priceAed * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t px-5 py-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">{cart("subtotal")}</dt><dd className="tabular-nums">{aed(order.subtotalAed)}</dd></div>
              {order.discountAed > 0 && <div className="flex justify-between text-gold-deep"><dt>{cart("discount")} ({order.discountCode})</dt><dd className="tabular-nums">−{aed(order.discountAed)}</dd></div>}
              {order.giftWrapAed > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">{cart("giftWrap")}</dt><dd className="tabular-nums">{aed(order.giftWrapAed)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">{cart("shipping")} · {ship(order.shippingMethod)}</dt><dd className="tabular-nums">{order.shippingAed === 0 ? cart("free") : aed(order.shippingAed)}</dd></div>
              <div className="flex justify-between border-t pt-2 font-medium"><dt>{cart("total")}</dt><dd className="tabular-nums">{aed(order.totalAed)}</dd></div>
            </dl>
            {order.giftWrap && (
              <p className="flex items-start gap-2 border-t px-5 py-4 text-sm text-muted-foreground">
                <Gift className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />
                {order.giftMessage ? `“${order.giftMessage}”` : cart("giftWrap")}
              </p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={t("contact")}>
            <div className="space-y-2 p-5 text-sm">
              <p className="font-medium">{order.customerName}</p>
              <a href={`mailto:${order.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Mail className="size-4" aria-hidden />{order.email}</a>
              <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground" dir="ltr"><Phone className="size-4" aria-hidden />{a.phone}</a>
            </div>
          </Panel>
          <Panel title={t("shipping")}>
            <p className="p-5 text-sm leading-relaxed text-muted-foreground">
              {a.fullName}<br />{a.building}, {a.street}<br />{a.area}, {em(a.emirate)}
              {a.notes && <><br /><span className="italic">{a.notes}</span></>}
            </p>
          </Panel>
          <Panel title={t("payment")}>
            <p className="p-5 text-sm text-muted-foreground">{order.paymentMethod === "stripe" ? "Stripe Checkout" : "Demo card •••• 4242"}</p>
          </Panel>
          <Panel title={t("timeline")}>
            <div className="p-5"><OrderTimeline order={order} /></div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
