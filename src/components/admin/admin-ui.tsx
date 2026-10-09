"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { formatMoney } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function useAed() {
  const locale = useLocale();
  return useCallback((aed: number) => formatMoney(aed, "AED", locale), [locale]);
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, className, children }: { title?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("border bg-background", className)}>
      {title && (
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
          <h2 className="font-display text-xl">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center text-sm text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}

export const thCls = "px-4 py-3 text-start text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted-foreground rtl:tracking-normal whitespace-nowrap";
export const tdCls = "px-4 py-3 align-middle";
export const fieldCls = "h-11 rounded-none bg-background";
