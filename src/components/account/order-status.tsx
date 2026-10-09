"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, CircleDot, PackageCheck, Truck, Sparkles, CreditCard, X } from "lucide-react";
import { ORDER_FLOW, type Order, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE: Record<OrderStatus, string> = {
  pending: "border-border bg-muted text-muted-foreground",
  paid: "border-gold/50 bg-gold/10 text-gold-deep",
  processing: "border-sky-800/20 bg-sky-50 text-sky-900",
  shipped: "border-indigo-800/20 bg-indigo-50 text-indigo-900",
  delivered: "border-emerald-800/20 bg-emerald-50 text-emerald-900",
  cancelled: "border-red-800/20 bg-red-50 text-red-900",
};

const ICON: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  pending: CircleDot,
  paid: CreditCard,
  processing: Sparkles,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: X,
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const t = useTranslations("status");
  return (
    <span className={cn("inline-flex items-center border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] rtl:tracking-normal", TONE[status], className)}>
      {t(status)}
    </span>
  );
}

export function useDateFormat() {
  const locale = useLocale();
  return (iso: string, withTime = false) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      timeZone: "Asia/Dubai",
    }).format(new Date(iso));
}

export function OrderTimeline({ order }: { order: Order }) {
  const t = useTranslations("status");
  const hint = useTranslations("statusHint");
  const fmt = useDateFormat();
  const cancelled = order.status === "cancelled";
  const reached = new Map(order.timeline.map((e) => [e.status, e]));
  const steps: OrderStatus[] = cancelled ? [...order.timeline.map((e) => e.status)] : ["pending", ...ORDER_FLOW];
  const currentIdx = steps.lastIndexOf(order.status);

  return (
    <ol className="relative space-y-0">
      {steps.map((s, i) => {
        const event = reached.get(s);
        const done = i <= currentIdx;
        const current = i === currentIdx;
        const Icon = ICON[s];
        return (
          <li key={`${s}-${i}`} className="relative flex gap-4 pb-8 last:pb-0">
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn("absolute start-[15px] top-8 h-[calc(100%-2rem)] w-px", i < currentIdx ? "bg-gold" : "bg-border")}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border",
                done ? "border-gold bg-gold text-ink" : "border-border bg-background text-muted-foreground",
                current && !cancelled && "ring-4 ring-gold/20",
                current && cancelled && s === "cancelled" && "border-red-800 bg-red-800 text-white",
              )}
            >
              {done && !current ? <Check className="size-4" aria-hidden /> : <Icon className="size-4" aria-hidden />}
            </span>
            <div className="pt-1">
              <p className={cn("text-sm font-medium", !done && "text-muted-foreground")}>
                {t(s)}
                {current && <span className="sr-only"> (current)</span>}
              </p>
              {current && <p className="mt-0.5 text-xs text-muted-foreground">{hint(s)}</p>}
              {event && <time dateTime={event.at} className="mt-1 block text-xs text-muted-foreground">{fmt(event.at, true)}</time>}
              {event?.note && <p className="mt-1 text-xs italic text-muted-foreground">{event.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
