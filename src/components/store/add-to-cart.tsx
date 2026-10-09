"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ProductSummary } from "@/components/providers/catalog-provider";
import type { Variant } from "@/lib/types";
import { useCart } from "@/stores/cart";
import { variantLabel } from "@/lib/product-utils";
import { cn } from "@/lib/utils";

export function useAddToCart() {
  const add = useCart((s) => s.add);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  const t = useTranslations("product");
  const locale = useLocale();
  return (product: ProductSummary, variant: Variant, quantity: number, opts?: { silent?: boolean; openDrawer?: boolean }) => {
    add(
      {
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        sizeMl: variant.sizeMl,
        label: variant.label,
        priceAed: variant.priceAed,
        maxStock: variant.stock,
      },
      quantity,
    );
    if (opts?.openDrawer ?? true) setDrawerOpen(true);
    if (!opts?.silent) toast.success(t("added"), { description: locale === "ar" ? product.name.ar : product.name.en });
  };
}

export function VariantPicker({
  variants,
  value,
  onChange,
  className,
}: {
  variants: Variant[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const t = useTranslations("product");
  const s = useTranslations("shop");
  const locale = useLocale();
  return (
    <fieldset className={className}>
      <legend className="mb-3 text-xs font-medium uppercase tracking-[0.2em] rtl:tracking-normal">{t("size")}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {variants.map((v) => {
          const selected = v.id === value;
          const out = v.stock === 0;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(v.id)}
              className={cn(
                "relative min-w-20 border px-4 py-3 text-sm transition-colors",
                selected ? "border-foreground bg-foreground text-background" : "border-input hover:border-foreground",
                out && "text-muted-foreground line-through decoration-1",
                out && selected && "text-background/70",
              )}
            >
              {variantLabel(v, locale, (size) => s("ml", { size }))}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function QuantityInput({
  value,
  onChange,
  max,
  className,
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  className?: string;
}) {
  const t = useTranslations("product");
  return (
    <div className={cn("inline-flex h-12 items-center border border-input", className)}>
      <button
        type="button"
        className="inline-flex h-full w-11 items-center justify-center hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label={t("decrease")}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite" aria-label={t("quantity")}>
        {value}
      </span>
      <button
        type="button"
        className="inline-flex h-full w-11 items-center justify-center hover:bg-muted disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t("increase")}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function useVariantState(variants: Variant[], initialId?: string) {
  const [variantId, setVariantId] = useState(initialId ?? variants[0]?.id);
  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  return { variant, variantId: variant?.id, setVariantId };
}
