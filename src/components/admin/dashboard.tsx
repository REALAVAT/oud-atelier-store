"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import { localized } from "@/lib/data/seed-products";
import type { Order } from "@/lib/types";
import { StatusBadge, useDateFormat } from "@/components/account/order-status";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, Panel, tdCls, thCls, useAed } from "./admin-ui";
import { cn } from "@/lib/utils";

const RevenueChart = dynamic(() => import("./revenue-chart").then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <Skeleton className="h-72 rounded-none" />,
});

const DAY = 86400000;
const counts = (o: Order) => o.status !== "cancelled" && o.status !== "pending";

function delta(curr: number, prev: number) {
  if (!prev) return curr ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

export function Dashboard() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const aed = useAed();
  const fmt = useDateFormat();
  const orders = useRepoQuery(() => repo.listOrders());
  const products = useRepoQuery(() => repo.listProducts());
  const settings = useRepoQuery(() => repo.getSettings());

  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    if (!orders.data) return null;
    const inRange = (o: Order, from: number, to: number) => {
      const ts = new Date(o.createdAt).getTime();
      return ts >= from && ts < to && counts(o);
    };
    const curr = orders.data.filter((o) => inRange(o, now - 30 * DAY, now + DAY));
    const prev = orders.data.filter((o) => inRange(o, now - 60 * DAY, now - 30 * DAY));
    const sum = (list: Order[]) => list.reduce((s, o) => s + o.totalAed, 0);
    const revenue = sum(curr);
    const prevRevenue = sum(prev);
    const aov = curr.length ? revenue / curr.length : 0;
    const prevAov = prev.length ? prevRevenue / prev.length : 0;
    const customers = new Set(curr.map((o) => o.email)).size;
    const prevCustomers = new Set(prev.map((o) => o.email)).size;

    const series = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now - (29 - i) * DAY);
      d.setHours(0, 0, 0, 0);
      return { date: d.toISOString(), revenue: 0 };
    });
    for (const o of curr) {
      const d = new Date(o.createdAt);
      d.setHours(0, 0, 0, 0);
      const slot = series.find((s) => s.date === d.toISOString());
      if (slot) slot.revenue += o.totalAed;
    }

    const units = new Map<string, { qty: number; revenue: number; name: Order["items"][number]["name"]; image: string; slug: string }>();
    for (const o of orders.data.filter(counts)) {
      for (const i of o.items) {
        const e = units.get(i.productId) ?? { qty: 0, revenue: 0, name: i.name, image: i.image, slug: i.slug };
        e.qty += i.quantity;
        e.revenue += i.priceAed * i.quantity;
        units.set(i.productId, e);
      }
    }
    const top = [...units.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);

    return {
      kpis: [
        { label: t("revenue"), value: aed(revenue), change: delta(revenue, prevRevenue) },
        { label: t("ordersCount"), value: String(curr.length), change: delta(curr.length, prev.length) },
        { label: t("aov"), value: aed(Math.round(aov)), change: delta(aov, prevAov) },
        { label: t("customersCount"), value: String(customers), change: delta(customers, prevCustomers) },
      ],
      series,
      top,
    };
  }, [orders.data, aed, t, now]);

  const lowStock = useMemo(() => {
    if (!products.data || !settings.data) return null;
    const threshold = settings.data.lowStockThreshold;
    return products.data
      .flatMap((p) => p.variants.filter((v) => v.stock <= threshold).map((v) => ({ p, v })))
      .sort((a, b) => a.v.stock - b.v.stock)
      .slice(0, 8);
  }, [products.data, settings.data]);

  return (
    <div>
      <PageHeader title={t("dashboard")} description={t("last30")} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats
          ? stats.kpis.map((k) => (
              <div key={k.label} className="border bg-background p-5">
                <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground rtl:tracking-normal">{k.label}</p>
                <p className="mt-3 font-display text-3xl tabular-nums">{k.value}</p>
                <p className={cn("mt-2 inline-flex items-center gap-1 text-xs", k.change >= 0 ? "text-emerald-800" : "text-red-800")}>
                  {k.change >= 0 ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
                  {t("vsPrev", { value: `${k.change >= 0 ? "+" : ""}${k.change}%` })}
                </p>
              </div>
            ))
          : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-none" />)}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title={t("revenueChart")}>
          <div className="p-4">{stats ? <RevenueChart data={stats.series} format={aed} /> : <Skeleton className="h-72 rounded-none" />}</div>
        </Panel>
        <Panel title={t("topProducts")}>
          <ul className="divide-y">
            {stats?.top.map(([id, e], idx) => (
              <li key={id} className="flex items-center gap-3 px-5 py-3">
                <span className="w-4 text-xs text-muted-foreground tabular-nums">{idx + 1}</span>
                <div className="relative size-10 shrink-0 bg-muted">
                  <Image src={e.image} alt="" fill sizes="40px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{localized(e.name, locale)}</p>
                  <p className="text-xs text-muted-foreground">{t("unitsSold", { count: e.qty })}</p>
                </div>
                <span className="text-sm tabular-nums">{aed(e.revenue)}</span>
              </li>
            )) ?? <Skeleton className="m-5 h-56 rounded-none" />}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title={t("recentOrders")} action={<Link href="/admin/orders" className="link-underline text-xs">{t("viewAll")}</Link>}>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-card">
                <tr>
                  <th className={thCls}>{t("orderNumber")}</th>
                  <th className={thCls}>{t("customer")}</th>
                  <th className={thCls}>{t("date")}</th>
                  <th className={thCls}>{t("status")}</th>
                  <th className={cn(thCls, "text-end")}>{t("total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.data?.slice(0, 6).map((o) => (
                  <tr key={o.id} className="hover:bg-card">
                    <td className={tdCls}>
                      <Link href={`/admin/orders/${o.id}`} className="font-medium whitespace-nowrap hover:text-gold-deep">{o.number}</Link>
                    </td>
                    <td className={cn(tdCls, "whitespace-nowrap")}>{o.customerName}</td>
                    <td className={cn(tdCls, "whitespace-nowrap text-muted-foreground")}>{fmt(o.createdAt)}</td>
                    <td className={tdCls}><StatusBadge status={o.status} /></td>
                    <td className={cn(tdCls, "text-end tabular-nums")}>{aed(o.totalAed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title={t("lowStock")}>
          {!lowStock ? (
            <Skeleton className="m-5 h-40 rounded-none" />
          ) : lowStock.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">{t("lowStockEmpty")}</p>
          ) : (
            <ul className="divide-y">
              {lowStock.map(({ p, v }) => (
                <li key={v.id}>
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-card">
                    <AlertTriangle className={cn("size-4 shrink-0", v.stock === 0 ? "text-red-700" : "text-gold-deep")} aria-hidden />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {localized(p.name, locale)} <span className="text-muted-foreground">· {v.sizeMl} ml</span>
                    </span>
                    <span className={cn("text-xs tabular-nums", v.stock === 0 ? "text-red-800" : "text-muted-foreground")}>
                      {t("left", { count: v.stock })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
