"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { useCatalog, type ProductSummary } from "@/components/providers/catalog-provider";
import type { CollectionSlug, Gender, ScentFamily } from "@/lib/types";
import { minPrice } from "@/lib/product-utils";
import { noteLabel } from "@/lib/data/notes";
import { ProductCard } from "./product-card";
import { useMoney } from "./price";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FilterSheet = dynamic(() => import("./filter-sheet"), { ssr: false });

const FAMILIES: ScentFamily[] = ["oud", "amber", "floral", "fresh", "woody", "musk"];
const GENDERS: Gender[] = ["feminine", "masculine", "unisex"];
const PRICES = ["0-400", "400-700", "700-1000", "1000-"] as const;
const SORTS = ["featured", "newest", "price-asc", "price-desc", "rating"] as const;
const PAGE = 12;

type Sort = (typeof SORTS)[number];
type Filters = {
  family: string[];
  notes: string[];
  price: string[];
  size: string[];
  gender: string[];
  sort: Sort;
};

const EMPTY: Filters = { family: [], notes: [], price: [], size: [], gender: [], sort: "featured" };

function parse(search: string): Filters {
  const sp = new URLSearchParams(search);
  const list = (k: string) => sp.get(k)?.split(",").filter(Boolean) ?? [];
  const sort = sp.get("sort") as Sort | null;
  return {
    family: list("family"),
    notes: list("notes"),
    price: list("price"),
    size: list("size"),
    gender: list("gender"),
    sort: sort && SORTS.includes(sort) ? sort : "featured",
  };
}

function serialize(f: Filters) {
  const sp = new URLSearchParams();
  (["family", "notes", "price", "size", "gender"] as const).forEach((k) => {
    if (f[k].length) sp.set(k, f[k].join(","));
  });
  if (f.sort !== "featured") sp.set("sort", f.sort);
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function matchFilters(products: ProductSummary[], f: Filters) {
  return products.filter((p) => {
    if (f.family.length && !f.family.includes(p.family)) return false;
    if (f.gender.length && !f.gender.includes(p.gender)) return false;
    if (f.notes.length) {
      const all = [...p.notes.top, ...p.notes.heart, ...p.notes.base];
      if (!f.notes.some((n) => all.includes(n))) return false;
    }
    if (f.size.length && !p.variants.some((v) => f.size.includes(String(v.sizeMl)))) return false;
    if (f.price.length) {
      const price = minPrice(p);
      const ok = f.price.some((r) => {
        const [min, max] = r.split("-").map((x) => (x ? Number(x) : Infinity));
        return price >= (min === Infinity ? 0 : min) && price < max;
      });
      if (!ok) return false;
    }
    return true;
  });
}

function applyFilters(products: ProductSummary[], f: Filters) {
  const sorted = matchFilters(products, f);
  switch (f.sort) {
    case "newest":
      sorted.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || b.createdAt.localeCompare(a.createdAt));
      break;
    case "price-asc":
      sorted.sort((a, b) => minPrice(a) - minPrice(b));
      break;
    case "price-desc":
      sorted.sort((a, b) => minPrice(b) - minPrice(a));
      break;
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    default:
      sorted.sort(
        (a, b) =>
          Number(!!b.featured) - Number(!!a.featured) ||
          Number(!!b.bestseller) - Number(!!a.bestseller) ||
          b.reviewCount - a.reviewCount,
      );
  }
  return sorted;
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string; count: number }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="border-b py-6 first:pt-0">
      <legend className="mb-4 text-xs font-medium uppercase tracking-[0.2em] rtl:tracking-normal">{title}</legend>
      <div className="space-y-3">
        {options.map((o) => {
          const id = `f-${title}-${o.value}`.replace(/\s+/g, "-");
          return (
            <div key={o.value} className="flex items-center gap-3">
              <input
                type="checkbox"
                id={id}
                checked={selected.includes(o.value)}
                onChange={() => onToggle(o.value)}
                disabled={o.count === 0 && !selected.includes(o.value)}
                className="size-4 shrink-0 cursor-pointer accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              <label
                htmlFor={id}
                className={cn("flex flex-1 cursor-pointer justify-between text-sm", o.count === 0 && "text-muted-foreground")}
              >
                <span>{o.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{o.count}</span>
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ShopBrowser({ collection }: { collection?: CollectionSlug }) {
  const t = useTranslations("shop");
  const fam = useTranslations("families");
  const gen = useTranslations("genders");
  const locale = useLocale();
  const money = useMoney();
  const { products: all } = useCatalog();
  const base = useMemo(() => (collection ? all.filter((p) => p.collection === collection) : all), [all, collection]);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [limit, setLimit] = useState(PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSeen, setSheetSeen] = useState(false);
  if (sheetOpen && !sheetSeen) setSheetSeen(true);
  const sentinel = useRef<HTMLDivElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!window.location.search) return;
    const parsed = parse(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters(parsed);
  }, []);

  const update = (next: Filters) => {
    setFilters(next);
    setLimit(PAGE);
    window.history.replaceState(null, "", `${window.location.pathname}${serialize(next)}`);
  };

  const toggle = (key: Exclude<keyof Filters, "sort">, value: string) => {
    const list = filters[key];
    update({ ...filters, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const results = useMemo(() => applyFilters(base, filters), [base, filters]);
  const visible = results.slice(0, limit);
  const activeCount = filters.family.length + filters.notes.length + filters.price.length + filters.size.length + filters.gender.length;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || visible.length >= results.length) return;
    const io = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && setLimit((l) => l + PAGE),
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible.length, results.length]);

  const countFor = (key: Exclude<keyof Filters, "sort">, value: string) => {
    const without = { ...filters, [key]: [] as string[] };
    return matchFilters(base, without).filter((p) => {
      if (key === "family") return p.family === value;
      if (key === "gender") return p.gender === value;
      if (key === "notes") return [...p.notes.top, ...p.notes.heart, ...p.notes.base].includes(value);
      if (key === "size") return p.variants.some((v) => String(v.sizeMl) === value);
      const [min, max] = value.split("-").map((x) => (x ? Number(x) : Infinity));
      const price = minPrice(p);
      return price >= (min === Infinity ? 0 : min) && price < max;
    }).length;
  };

  const noteOptions = useMemo(() => {
    const freq = new Map<string, number>();
    base.forEach((p) => [...p.notes.top, ...p.notes.heart, ...p.notes.base].forEach((n) => freq.set(n, (freq.get(n) ?? 0) + 1)));
    return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([n]) => n);
  }, [base]);

  const sizeOptions = useMemo(
    () => [...new Set(base.flatMap((p) => p.variants.filter((v) => !v.label).map((v) => v.sizeMl)))].sort((a, b) => a - b),
    [base],
  );

  const priceLabel = (r: string) => {
    const [min, max] = r.split("-");
    if (min === "0") return t("under", { amount: money(Number(max)) });
    if (!max) return t("over", { amount: money(Number(min)) });
    return t("between", { min: money(Number(min)), max: money(Number(max)) });
  };

  const panel = (
    <div>
      <FilterGroup
        title={t("family")}
        options={FAMILIES.map((f) => ({ value: f, label: fam(f), count: countFor("family", f) }))}
        selected={filters.family}
        onToggle={(v) => toggle("family", v)}
      />
      <FilterGroup
        title={t("gender")}
        options={GENDERS.map((g) => ({ value: g, label: gen(g), count: countFor("gender", g) }))}
        selected={filters.gender}
        onToggle={(v) => toggle("gender", v)}
      />
      <FilterGroup
        title={t("price")}
        options={PRICES.map((p) => ({ value: p, label: priceLabel(p), count: countFor("price", p) }))}
        selected={filters.price}
        onToggle={(v) => toggle("price", v)}
      />
      <FilterGroup
        title={t("size")}
        options={sizeOptions.map((s) => ({ value: String(s), label: t("ml", { size: s }), count: countFor("size", String(s)) }))}
        selected={filters.size}
        onToggle={(v) => toggle("size", v)}
      />
      <FilterGroup
        title={t("notes")}
        options={noteOptions.map((n) => ({ value: n, label: noteLabel(n, locale), count: countFor("notes", n) }))}
        selected={filters.notes}
        onToggle={(v) => toggle("notes", v)}
      />
    </div>
  );

  const chips = (["family", "gender", "price", "size", "notes"] as const).flatMap((k) =>
    filters[k].map((v) => ({
      key: k,
      value: v,
      label:
        k === "family" ? fam(v) : k === "gender" ? gen(v) : k === "price" ? priceLabel(v) : k === "size" ? t("ml", { size: v }) : noteLabel(v, locale),
    })),
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
      <aside className="hidden lg:block" aria-label={t("filters")}>
        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pe-2 no-scrollbar">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xs font-medium uppercase tracking-[0.2em] rtl:tracking-normal">{t("filters")}</h2>
            {activeCount > 0 && (
              <button type="button" onClick={() => update({ ...EMPTY, sort: filters.sort })} className="text-xs underline-offset-4 hover:underline">
                {t("clearAll")}
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-5">
          <div className="flex items-center gap-3">
            <Button ref={filterButton} variant="outline" size="sm" className="lg:hidden" onClick={() => setSheetOpen(true)}>
              <SlidersHorizontal />
              {t("filters")}
              {activeCount > 0 && <span className="ms-1 rounded-full bg-foreground px-1.5 text-[0.6rem] text-background">{activeCount}</span>}
            </Button>
            <h2 className="text-sm font-normal text-muted-foreground" aria-live="polite">
              {t("results", { count: results.length })}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="sort" className="hidden text-xs uppercase tracking-[0.18em] text-muted-foreground sm:inline rtl:tracking-normal">
              {t("sort")}
            </label>
            <span className="relative inline-flex">
              <select
                id="sort"
                aria-label={t("sort")}
                value={filters.sort}
                onChange={(e) => update({ ...filters, sort: e.target.value as Sort })}
                className="h-9 w-48 cursor-pointer appearance-none border border-input bg-transparent ps-3 pe-8 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="featured">{t("sortFeatured")}</option>
                <option value="newest">{t("sortNewest")}</option>
                <option value="price-asc">{t("sortPriceAsc")}</option>
                <option value="price-desc">{t("sortPriceDesc")}</option>
                <option value="rating">{t("sortRating")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            </span>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c.key + c.value}
                type="button"
                onClick={() => toggle(c.key, c.value)}
                className="inline-flex items-center gap-1.5 border border-foreground/70 px-3 py-1.5 text-xs hover:bg-foreground hover:text-background"
              >
                {c.label} <X className="size-3" aria-hidden />
              </button>
            ))}
            <button type="button" onClick={() => update({ ...EMPTY, sort: filters.sort })} className="px-2 text-xs underline underline-offset-4">
              {t("clearAll")}
            </button>
          </div>
        )}

        {results.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <p className="font-display text-3xl">{t("noResults")}</p>
            <p className="mt-3 text-muted-foreground">{t("noResultsBody")}</p>
            <Button className="mt-8" variant="outline" onClick={() => update(EMPTY)}>
              {t("clearAll")}
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3">
              {visible.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} sizes="(min-width: 1024px) 28vw, (min-width: 768px) 33vw, 50vw" />
              ))}
            </div>
            <div ref={sentinel} className="mt-14 flex flex-col items-center gap-4">
              <p className="text-xs text-muted-foreground">{t("showing", { shown: visible.length, total: results.length })}</p>
              <div className="h-px w-40 bg-border">
                <div className="h-px bg-foreground transition-all" style={{ width: `${(visible.length / results.length) * 100}%` }} />
              </div>
              {visible.length < results.length && (
                <Button variant="outline" onClick={() => setLimit((l) => l + PAGE)}>
                  {t("loadMore")}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {sheetSeen && (
        <FilterSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title={t("filters")}
          returnFocus={filterButton}
          description={t("results", { count: results.length })}
          footer={
            <>
              <Button variant="outline" onClick={() => update({ ...EMPTY, sort: filters.sort })}>
                {t("clearAll")}
              </Button>
              <Button onClick={() => setSheetOpen(false)}>{t("showResults", { count: results.length })}</Button>
            </>
          }
        >
          {panel}
        </FilterSheet>
      )}
    </div>
  );
}
