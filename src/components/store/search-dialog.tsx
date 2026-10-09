"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Search, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUi } from "@/stores/ui";
import { usePrefs } from "@/stores/prefs";
import { useCatalog } from "@/components/providers/catalog-provider";
import { searchProducts } from "@/lib/search";
import { localized } from "@/lib/data/seed-products";
import { minPrice } from "@/lib/product-utils";
import { Price } from "./price";
import { useHydrated } from "@/hooks/use-hydrated";

const POPULAR = { en: ["Oud", "Rose", "Saffron", "Musk", "Gift"], ar: ["عود", "ورد", "زعفران", "مسك", "هدية"] };

function SearchBody() {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useHydrated();
  const close = () => useUi.getState().setSearchOpen(false);
  const { products } = useCatalog();
  const recent = usePrefs((s) => s.recentSearches);
  const pushSearch = usePrefs((s) => s.pushSearch);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const results = useMemo(() => (deferred.trim().length >= 2 ? searchProducts(products, deferred) : []), [products, deferred]);

  const submit = (q: string) => {
    if (!q.trim()) return;
    pushSearch(q.trim());
    close();
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="flex max-h-[85dvh] flex-col">
      <DialogTitle className="sr-only">{t("title")}</DialogTitle>
      <DialogDescription className="sr-only">{t("placeholder")}</DialogDescription>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="flex items-center gap-3 border-b px-5 sm:px-8"
        role="search"
      >
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="h-16 flex-1 bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground sm:h-20 sm:text-2xl [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="button" onClick={close} className="inline-flex size-10 items-center justify-center" aria-label={t("title")}>
          <X className="size-5" />
        </button>
      </form>
      <div className="overflow-y-auto px-5 py-6 sm:px-8" aria-live="polite">
        {deferred.trim().length < 2 ? (
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="eyebrow">{t("popular")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {POPULAR[locale === "ar" ? "ar" : "en"].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuery(q)}
                    className="border border-input px-4 py-2 text-sm hover:border-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
            {hydrated && recent.length > 0 && (
              <div>
                <p className="eyebrow">{t("recent")}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {recent.map((q) => (
                    <li key={q}>
                      <button type="button" onClick={() => setQuery(q)} className="hover:text-gold-deep">
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : results.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">{t("noResults", { query: deferred })}</p>
        ) : (
          <>
            <p className="eyebrow">{t("products")}</p>
            <ul className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {results.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.slug}`}
                    onClick={() => {
                      pushSearch(query.trim());
                      close();
                    }}
                    className="group flex items-center gap-4"
                  >
                    <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-muted">
                      <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-lg group-hover:text-gold-deep">{localized(p.name, locale)}</span>
                      <span className="block truncate text-xs text-muted-foreground">{localized(p.tagline, locale)}</span>
                      <Price aed={minPrice(p)} className="text-sm" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => submit(query)}
              className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] hover:text-gold-deep rtl:tracking-normal"
            >
              {t("viewAll", { count: results.length })} <ArrowRight className="size-4 rtl:rotate-180" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function SearchDialog() {
  const open = useUi((s) => s.searchOpen);
  const setOpen = useUi((s) => s.setSearchOpen);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="top-0 max-w-none translate-y-0 gap-0 rounded-none bg-background p-0 ring-0 sm:top-[8vh] sm:max-w-3xl"
      >
        {open && <SearchBody />}
      </DialogContent>
    </Dialog>
  );
}
