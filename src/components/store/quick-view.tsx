"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUi } from "@/stores/ui";
import { useCatalog, type ProductSummary } from "@/components/providers/catalog-provider";
import { localized } from "@/lib/data/seed-products";
import { noteLabel } from "@/lib/data/notes";
import { defaultVariant } from "@/lib/product-utils";
import { Price } from "./price";
import { RatingStars } from "./rating-stars";
import { QuantityInput, VariantPicker, useAddToCart } from "./add-to-cart";

function QuickViewBody({ product }: { product: ProductSummary }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const close = useUi((s) => s.setQuickViewId);
  const addToCart = useAddToCart();
  const [variantId, setVariantId] = useState(defaultVariant(product)?.id);
  const [qty, setQty] = useState(1);
  const [image, setImage] = useState(0);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const out = !variant || variant.stock === 0;

  return (
    <div className="grid max-h-[90dvh] overflow-y-auto md:grid-cols-2">
      <div className="bg-muted">
        <div className="relative aspect-[4/5]">
          <Image
            src={product.images[image] ?? product.images[0]}
            alt={localized(product.name, locale)}
            fill
            sizes="(min-width: 768px) 420px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex gap-2 p-3">
          {product.images.slice(0, 4).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setImage(i)}
              className={`relative size-14 overflow-hidden border ${i === image ? "border-foreground" : "border-transparent"}`}
              aria-label={t("image", { index: i + 1 })}
            >
              <Image src={src} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 p-6 md:p-8">
        <div>
          <DialogTitle className="font-display text-3xl font-normal leading-tight">
            {localized(product.name, locale)}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-muted-foreground">
            {localized(product.tagline, locale)}
          </DialogDescription>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <RatingStars rating={product.rating} size={13} label={t("ratingLabel", { rating: product.rating })} />
            <span>{t("reviewsCount", { count: product.reviewCount })}</span>
          </div>
        </div>
        {variant && <Price aed={variant.priceAed} compareAt={variant.compareAtAed} className="text-xl" />}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {[...product.notes.top, ...product.notes.heart, ...product.notes.base]
            .slice(0, 6)
            .map((n) => noteLabel(n, locale))
            .join(" · ")}
        </p>
        <VariantPicker variants={product.variants} value={variant?.id ?? ""} onChange={setVariantId} />
        <div className="flex gap-3">
          <QuantityInput value={qty} onChange={setQty} max={Math.max(1, variant?.stock ?? 1)} />
          <Button
            className="flex-1"
            disabled={out}
            onClick={() => {
              if (!variant) return;
              addToCart(product, variant, qty);
              close(null);
            }}
          >
            {out ? t("soldOut") : t("addToCart")}
          </Button>
        </div>
        <Link
          href={`/products/${product.slug}`}
          onClick={() => close(null)}
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] hover:text-gold-deep rtl:tracking-normal"
        >
          {t("viewDetails")} <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}

export function QuickView() {
  const id = useUi((s) => s.quickViewId);
  const setId = useUi((s) => s.setQuickViewId);
  const { products } = useCatalog();
  const product = products.find((p) => p.id === id);

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && setId(null)}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] gap-0 overflow-hidden rounded-none bg-background p-0 sm:max-w-4xl">
        {product && <QuickViewBody key={product.id} product={product} />}
      </DialogContent>
    </Dialog>
  );
}
