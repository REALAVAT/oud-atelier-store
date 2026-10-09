"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { CURRENCIES, type Currency } from "@/lib/currency";
import { usePrefs } from "@/stores/prefs";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

function LocaleLink({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const search = useSearchParams();
  const other = locale === "ar" ? "en" : "ar";
  const query = search.toString();
  return (
    <Link
      href={query ? `${pathname}?${query}` : pathname}
      locale={other}
      hrefLang={other}
      lang={other}
      className={cn("text-sm hover:text-gold-deep transition-colors", other === "ar" ? "font-[family-name:var(--font-naskh),serif]" : "", className)}
      aria-label={t("language")}
    >
      {t("switchTo")}
    </Link>
  );
}

export function LocaleSwitcher({ className }: { className?: string }) {
  return (
    <Suspense fallback={<span className={cn("text-sm", className)}>…</span>}>
      <LocaleLink className={className} />
    </Suspense>
  );
}

export function CurrencySwitcher({ className, light }: { className?: string; light?: boolean }) {
  const t = useTranslations("nav");
  const hydrated = useHydrated();
  const currency = usePrefs((s) => s.currency);
  const setCurrency = usePrefs((s) => s.setCurrency);
  const value = hydrated ? currency : "AED";
  return (
    <span
      className={cn(
        "relative inline-flex items-center text-xs font-medium tracking-[0.14em] hover:text-gold-deep",
        light && "text-ivory hover:text-gold-light",
        className,
      )}
    >
      <select
        value={value}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        aria-label={t("currency")}
        className="cursor-pointer appearance-none bg-transparent py-0.5 pe-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c} className="bg-background text-foreground">
            {c}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-0 size-3" aria-hidden />
    </span>
  );
}
