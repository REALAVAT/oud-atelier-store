"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { repo, useRepoQuery } from "@/lib/repo";
import { useDateFormat } from "@/components/account/order-status";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyRow, PageHeader, tdCls, thCls, useAed } from "./admin-ui";
import { cn } from "@/lib/utils";

export function CustomersTable() {
  const t = useTranslations("admin");
  const aed = useAed();
  const fmt = useDateFormat();
  const { data, loading } = useRepoQuery(() => repo.listCustomers());
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...(data ?? [])]
      .filter((c) => !term || `${c.name} ${c.email} ${c.phone ?? ""}`.toLowerCase().includes(term))
      .sort((a, b) => b.totalSpentAed - a.totalSpentAed);
  }, [data, q]);

  return (
    <div>
      <PageHeader title={t("customers")} description={data ? String(data.length) : undefined} />
      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchCustomers")} aria-label={t("searchCustomers")} className="h-10 rounded-none bg-background ps-9" />
      </div>
      <div className="relative overflow-x-auto border bg-background">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b bg-card">
            <tr>
              <th className={thCls}>{t("customer")}</th>
              <th className={thCls}>{t("joined")}</th>
              <th className={cn(thCls, "text-end")}>{t("ordersShort")}</th>
              <th className={cn(thCls, "text-end")}>{t("spent")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && !data
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="p-3"><Skeleton className="h-8 rounded-none" /></td></tr>
                ))
              : rows.length === 0
                ? <EmptyRow colSpan={4}>{t("noCustomers")}</EmptyRow>
                : rows.map((c) => (
                    <tr key={c.id} className="hover:bg-card">
                      <td className={tdCls}>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-medium text-gold-deep" aria-hidden>
                            {c.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{c.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{c.email}{c.phone && <> · <span dir="ltr">{c.phone}</span></>}</p>
                          </div>
                        </div>
                      </td>
                      <td className={cn(tdCls, "whitespace-nowrap text-muted-foreground")}>{fmt(c.createdAt)}</td>
                      <td className={cn(tdCls, "text-end tabular-nums")}>{c.ordersCount}</td>
                      <td className={cn(tdCls, "text-end tabular-nums")}>{aed(c.totalSpentAed)}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
