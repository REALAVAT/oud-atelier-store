"use client";

import { useLocale } from "next-intl";
import { formatMoney } from "@/lib/currency";
import { usePrefs } from "@/stores/prefs";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";

export function useMoney() {
  const locale = useLocale();
  const hydrated = useHydrated();
  const currency = usePrefs((s) => s.currency);
  const active = hydrated ? currency : "AED";
  return (aed: number) => formatMoney(aed, active, locale);
}

export function Price({
  aed,
  compareAt,
  className,
}: {
  aed: number;
  compareAt?: number;
  className?: string;
}) {
  const money = useMoney();
  return (
    <span className={cn("tabular-nums", className)}>
      {compareAt && compareAt > aed ? (
        <>
          {money(aed)}{" "}
          <s className="text-muted-foreground ms-1.5 text-[0.85em]">{money(compareAt)}</s>
        </>
      ) : (
        money(aed)
      )}
    </span>
  );
}
