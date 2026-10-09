import type { Product, Variant } from "@/lib/types";

export type ProductSummary = Omit<Product, "description" | "seo">;

export function toSummary(p: Product): ProductSummary {
  const { description: _d, seo: _s, ...rest } = p;
  return rest;
}

type WithVariants = { variants: Variant[] };

export function minPrice(p: WithVariants) {
  return p.variants.length ? Math.min(...p.variants.map((v) => v.priceAed)) : 0;
}

export function totalStock(p: WithVariants) {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}

export function defaultVariant(p: WithVariants) {
  const inStock = p.variants.filter((v) => v.stock > 0);
  const pool = inStock.length ? inStock : p.variants;
  return pool.find((v) => v.sizeMl === 50) ?? pool[Math.min(1, pool.length - 1)] ?? pool[0];
}

export function variantLabel(v: Variant, locale: string, mlLabel: (size: number) => string) {
  if (v.label) return locale === "ar" ? v.label.ar : v.label.en;
  return mlLabel(v.sizeMl);
}
