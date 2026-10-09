"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useCatalog } from "@/components/providers/catalog-provider";
import { searchProducts } from "@/lib/search";
import { ProductCard } from "./product-card";
import { usePrefs } from "@/stores/prefs";

const POPULAR = ["oud", "rose", "saffron", "amber", "musk", "neroli"];

function SearchField({ initial, onSubmit }: { initial: string; onSubmit: (q: string) => void }) {
  const t = useTranslations("search");
  const [query, setQuery] = useState(initial);
  return (
    <form
      role="search"
      className="mt-8 flex max-w-2xl items-center gap-3 border-b border-foreground pb-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(query);
      }}
    >
      <Search className="size-5 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("placeholder")}
        aria-label={t("placeholder")}
        className="h-10 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onSubmit("");
          }}
          aria-label={t("title")}
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}

export function SearchResults() {
  const t = useTranslations("search");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { products } = useCatalog();
  const addRecent = usePrefs((s) => s.pushSearch);
  const initial = params.get("q") ?? "";
  const results = useMemo(() => searchProducts(products, initial), [products, initial]);

  const submit = (q: string) => {
    const value = q.trim();
    if (value) addRecent(value);
    router.replace(value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname, { scroll: false });
  };

  return (
    <div className="py-12 lg:py-20">
      <h1 className="font-display text-5xl sm:text-6xl">{initial ? t("results", { query: initial }) : t("title")}</h1>
      <SearchField key={initial} initial={initial} onSubmit={submit} />

      {!initial && (
        <div className="mt-10">
          <p className="eyebrow">{t("popular")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {POPULAR.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => submit(term)}
                className="border px-4 py-2 text-sm capitalize transition-colors hover:border-foreground"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {initial && (
        <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
          {results.length} · {t("products")}
        </p>
      )}

      {initial && results.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-display text-3xl">{t("noResults", { query: initial })}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} headingLevel={2} />
          ))}
        </div>
      )}
    </div>
  );
}
