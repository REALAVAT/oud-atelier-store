"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import { useSession } from "@/lib/session";
import { useMoney } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, useDateFormat } from "./order-status";

export function useMyOrders() {
  const { user } = useSession();
  return useRepoQuery(() => repo.listMyOrders(user!.id, user!.email), [user?.id], !!user);
}

export function OrdersEmpty() {
  const t = useTranslations("account");
  const cart = useTranslations("cart");
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed px-6 py-16 text-center">
      <Package className="size-8 text-gold-deep" strokeWidth={1.2} aria-hidden />
      <p className="font-display text-2xl">{t("noOrders")}</p>
      <p className="text-sm text-muted-foreground">{t("noOrdersBody")}</p>
      <Button asChild className="mt-2">
        <Link href="/shop">{cart("emptyCta")}</Link>
      </Button>
    </div>
  );
}

export function OrdersList({ limit }: { limit?: number }) {
  const t = useTranslations("account");
  const cart = useTranslations("cart");
  const money = useMoney();
  const fmt = useDateFormat();
  const { data, loading } = useMyOrders();

  if (loading || !data) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-none" />
        ))}
      </div>
    );
  }
  if (!data.length) return <OrdersEmpty />;

  return (
    <ul className="space-y-3">
      {data.slice(0, limit).map((o) => (
        <li key={o.id}>
          <Link
            href={`/account/orders/${o.id}`}
            className="group flex flex-col gap-4 border bg-card p-5 transition-colors hover:border-foreground sm:flex-row sm:items-center"
          >
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {o.items.slice(0, 3).map((i) => (
                <div key={i.variantId} className="relative h-16 w-13 overflow-hidden border-2 border-card bg-muted">
                  <Image src={i.image} alt="" fill sizes="52px" className="object-cover" />
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-display text-xl">{o.number}</span>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("placed", { date: fmt(o.createdAt) })} · {cart("items", { count: o.items.reduce((s, i) => s + i.quantity, 0) })}
              </p>
            </div>
            <div className="flex items-center justify-between gap-6 sm:justify-end">
              <span className="font-medium tabular-nums">{money(o.totalAed)}</span>
              <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-muted-foreground group-hover:text-foreground rtl:tracking-normal">
                {t("viewOrder")} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
