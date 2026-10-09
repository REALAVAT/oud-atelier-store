"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import type { OrderStatus } from "@/lib/types";
import { StatusBadge, useDateFormat } from "@/components/account/order-status";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyRow, PageHeader, tdCls, thCls, useAed } from "./admin-ui";
import { cn } from "@/lib/utils";

const STATUSES: OrderStatus[] = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const PAGE = 15;

export function OrdersTable() {
  const t = useTranslations("admin");
  const st = useTranslations("status");
  const common = useTranslations("common");
  const ship = useTranslations("shippingMethods");
  const locale = useLocale();
  const aed = useAed();
  const fmt = useDateFormat();
  const { data, loading } = useRepoQuery(() => repo.listOrders());
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(0);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of data ?? []) m.set(o.status, (m.get(o.status) ?? 0) + 1);
    return m;
  }, [data]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (!term || `${o.number} ${o.customerName} ${o.email}`.toLowerCase().includes(term)),
    );
  }, [data, q, status]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const visible = rows.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <div>
      <PageHeader title={t("orders")} description={data ? String(data.length) : undefined} />

      <div className="relative no-scrollbar mb-4 flex gap-1 overflow-x-auto border-b">
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(0);
            }}
            aria-pressed={status === s}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-sm whitespace-nowrap transition-colors",
              status === s ? "border-gold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {s === "all" ? t("allStatuses") : st(s as OrderStatus)}
            <span className="ms-1.5 text-xs text-muted-foreground tabular-nums">{s === "all" ? data?.length ?? 0 : counts.get(s) ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder={t("searchOrders")}
            aria-label={t("searchOrders")}
            className="h-10 rounded-none bg-background ps-9"
          />
        </div>
        <Select value={status} onValueChange={(s) => { setStatus(s); setPage(0); }} dir={locale === "ar" ? "rtl" : "ltr"}>
          <SelectTrigger className="h-10! w-full rounded-none bg-background sm:hidden" aria-label={t("status")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{st(s)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="relative overflow-x-auto border bg-background">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b bg-card">
            <tr>
              <th className={thCls}>{t("orderNumber")}</th>
              <th className={thCls}>{t("date")}</th>
              <th className={thCls}>{t("customer")}</th>
              <th className={thCls}>{t("shipping")}</th>
              <th className={thCls}>{t("status")}</th>
              <th className={cn(thCls, "text-end")}>{t("total")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && !data
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-3"><Skeleton className="h-8 rounded-none" /></td></tr>
                ))
              : visible.length === 0
                ? <EmptyRow colSpan={6}>{t("noOrders")}</EmptyRow>
                : visible.map((o) => (
                    <tr key={o.id} className="relative hover:bg-card">
                      <td className={tdCls}>
                        <Link href={`/admin/orders/${o.id}`} className="font-medium whitespace-nowrap after:absolute after:inset-0 hover:text-gold-deep">{o.number}</Link>
                      </td>
                      <td className={cn(tdCls, "whitespace-nowrap text-muted-foreground")}>{fmt(o.createdAt, true)}</td>
                      <td className={tdCls}>
                        <p className="whitespace-nowrap">{o.customerName}</p>
                        <p className="text-xs text-muted-foreground">{o.email}</p>
                      </td>
                      <td className={cn(tdCls, "whitespace-nowrap text-muted-foreground")}>{ship(o.shippingMethod)}</td>
                      <td className={tdCls}><StatusBadge status={o.status} /></td>
                      <td className={cn(tdCls, "text-end tabular-nums")}>{aed(o.totalAed)}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground tabular-nums">{page + 1} / {pages}</span>
          <div className="flex gap-2">
            <button type="button" className="border px-3 py-1.5 disabled:opacity-40" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>{common("previous")}</button>
            <button type="button" className="border px-3 py-1.5 disabled:opacity-40" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>{common("next")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
