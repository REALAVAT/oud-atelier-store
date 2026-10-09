"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Eye } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ProductSummary } from "@/components/providers/catalog-provider";
import { localized } from "@/lib/data/seed-products";
import { minPrice, totalStock } from "@/lib/product-utils";
import { Price } from "./price";
import { RatingStars } from "./rating-stars";
import { WishlistButton } from "./wishlist-button";
import { useUi } from "@/stores/ui";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority,
  className,
  sizes = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw",
  headingLevel = 3,
}: {
  product: ProductSummary;
  priority?: boolean;
  className?: string;
  sizes?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const t = useTranslations("product");
  const locale = useLocale();
  const setQuickViewId = useUi((s) => s.setQuickViewId);
  const name = localized(product.name, locale);
  const soldOut = totalStock(product) === 0;
  const hover = product.images[1];

  return (
    <article className={cn("group/card relative", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-[1]" aria-label={name}>
          <Image
            src={product.images[0]}
            alt={name}
            fill
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
            sizes={sizes}
            className={cn(
              "object-cover transition-[opacity,transform] duration-[1.2s] ease-[var(--ease-luxe)] group-hover/card:scale-[1.04]",
              hover && "group-hover/card:opacity-0",
            )}
          />
          {hover && (
            <Image
              src={hover}
              alt=""
              fill
              sizes={sizes}
              loading="lazy"
              className="scale-[1.04] object-cover opacity-0 transition-[opacity,transform] duration-[1.2s] ease-[var(--ease-luxe)] group-hover/card:scale-100 group-hover/card:opacity-100"
            />
          )}
        </Link>
        <div className="pointer-events-none absolute inset-x-3 top-3 z-[2] flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            {soldOut ? (
              <span className="bg-foreground px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-background rtl:tracking-normal">
                {t("soldOut")}
              </span>
            ) : product.isNew ? (
              <span className="bg-background px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] rtl:tracking-normal">
                {t("new")}
              </span>
            ) : product.bestseller ? (
              <span className="bg-gold px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-ink rtl:tracking-normal">
                {t("bestseller")}
              </span>
            ) : null}
          </div>
          <WishlistButton productId={product.id} className="pointer-events-auto" />
        </div>
        <button
          type="button"
          onClick={() => setQuickViewId(product.id)}
          className="absolute inset-x-3 bottom-3 z-[2] hidden h-11 translate-y-2 items-center justify-center gap-2 bg-background/95 text-[0.68rem] font-medium uppercase tracking-[0.2em] opacity-0 backdrop-blur transition-all duration-500 hover:bg-foreground hover:text-background focus-visible:translate-y-0 focus-visible:opacity-100 group-hover/card:translate-y-0 group-hover/card:opacity-100 md:flex rtl:tracking-normal rtl:text-xs"
        >
          <Eye className="size-4" aria-hidden />
          {t("quickView")}
        </button>
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground rtl:tracking-normal">
          {localized(product.tagline, locale).split(",")[0]}
        </p>
        <Heading className="font-display text-xl leading-tight">
          <Link href={`/products/${product.slug}`} className="hover:text-gold-deep">
            {name}
          </Link>
        </Heading>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
          <span>
            {product.variants.length > 1 && <span className="text-muted-foreground">{t("from")} </span>}
            <Price aed={minPrice(product)} />
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <RatingStars rating={product.rating} size={12} label={t("ratingLabel", { rating: product.rating })} />
            <span aria-hidden>({product.reviewCount})</span>
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-[4/5] animate-pulse bg-muted" />
      <div className="mt-4 h-3 w-1/3 animate-pulse bg-muted" />
      <div className="mt-2 h-5 w-2/3 animate-pulse bg-muted" />
      <div className="mt-2 h-4 w-1/4 animate-pulse bg-muted" />
    </div>
  );
}
