"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Gift, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import type { Product } from "@/lib/types";
import { useLiveProduct } from "@/components/providers/catalog-provider";
import { localized } from "@/lib/data/seed-products";
import { defaultVariant } from "@/lib/product-utils";
import { Price, useMoney } from "./price";
import { RatingStars } from "./rating-stars";
import { WishlistButton } from "./wishlist-button";
import { ProductGallery } from "./product-gallery";
import { QuantityInput, VariantPicker, useAddToCart } from "./add-to-cart";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export function ProductView({ product: initial, breadcrumbs }: { product: Product; breadcrumbs?: React.ReactNode }) {
  const product = useLiveProduct(initial);
  const t = useTranslations("product");
  const fam = useTranslations("families");
  const gen = useTranslations("genders");
  const occ = useTranslations("occasions");
  const nav = useTranslations("nav");
  const home = useTranslations("home");
  const locale = useLocale();
  const router = useRouter();
  const money = useMoney();
  const addToCart = useAddToCart();
  const [variantId, setVariantId] = useState(() => defaultVariant(product)?.id);
  const [qty, setQty] = useState(1);
  const [showSticky, setShowSticky] = useState(false);
  const atcRef = useRef<HTMLDivElement>(null);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const name = localized(product.name, locale);
  const out = !variant || variant.stock === 0;
  const low = variant && variant.stock > 0 && variant.stock <= 5;

  useEffect(() => {
    const el = atcRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = () => variant && addToCart(product, variant, qty);
  const buyNow = () => {
    if (!variant) return;
    addToCart(product, variant, qty, { silent: true, openDrawer: false });
    router.push("/checkout");
  };

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-16 xl:gap-24">
        <ProductGallery images={product.images} name={name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          {breadcrumbs}
          <p className="eyebrow mt-6">{nav(product.collection) === fam(product.family) ? nav(product.collection) : `${nav(product.collection)} · ${fam(product.family)}`}</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">{name}</h1>
            <WishlistButton productId={product.id} className="mt-1 shrink-0 border" />
          </div>
          <p className="mt-3 text-muted-foreground">{localized(product.tagline, locale)}</p>
          <a href="#reviews" className="mt-4 inline-flex items-center gap-2 text-sm hover:text-gold-deep">
            <RatingStars rating={product.rating} label={t("ratingLabel", { rating: product.rating })} />
            <span className="underline-offset-4 hover:underline">{t("reviewsCount", { count: product.reviewCount })}</span>
          </a>

          <div className="mt-6 flex items-baseline gap-3">
            {variant && <Price aed={variant.priceAed} compareAt={variant.compareAtAed} className="text-2xl" />}
            {variant?.compareAtAed && variant.compareAtAed > variant.priceAed && (
              <span className="bg-gold/15 px-2 py-0.5 text-xs text-gold-deep">
                {t("save", { amount: money(variant.compareAtAed - variant.priceAed) })}
              </span>
            )}
          </div>

          <div className="mt-8 space-y-6 border-t pt-8">
            <VariantPicker variants={product.variants} value={variant?.id ?? ""} onChange={(id) => { setVariantId(id); setQty(1); }} />
            <p className={cn("flex items-center gap-2 text-sm", out ? "text-destructive" : low ? "text-gold-deep" : "text-muted-foreground")} aria-live="polite">
              <span className={cn("size-2 rounded-full", out ? "bg-destructive" : low ? "bg-gold" : "bg-emerald-700")} aria-hidden />
              {out ? t("soldOut") : low ? t("lowStock", { count: variant.stock }) : t("inStock")}
            </p>
            <div ref={atcRef} className="flex flex-col gap-3 sm:flex-row">
              <QuantityInput value={qty} onChange={setQty} max={Math.max(1, variant?.stock ?? 1)} className="self-start" />
              <Button className="flex-1" size="lg" disabled={out} onClick={add}>
                {out ? t("soldOut") : t("addToCart")}
              </Button>
            </div>
            <Button variant="outline" size="lg" className="w-full" disabled={out} onClick={buyNow}>
              {t("buyNow")}
            </Button>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <li className="flex items-center gap-2"><Truck className="size-4 shrink-0 text-gold-deep" aria-hidden />{home("perkDelivery")}</li>
            <li className="flex items-center gap-2"><Gift className="size-4 shrink-0 text-gold-deep" aria-hidden />{home("perkWrap")}</li>
            <li className="flex items-center gap-2"><RotateCcw className="size-4 shrink-0 text-gold-deep" aria-hidden />{home("perkSamples")}</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 shrink-0 text-gold-deep" aria-hidden />{home("perkAuthentic")}</li>
          </ul>

          <Accordion type="multiple" defaultValue={["description"]} className="mt-8 border-t">
            <AccordionItem value="description">
              <AccordionTrigger headingLevel={2} className="py-5 text-xs font-medium uppercase tracking-[0.2em] hover:no-underline rtl:tracking-normal">
                {t("description")}
              </AccordionTrigger>
              <AccordionContent className="text-[0.95rem] leading-relaxed text-muted-foreground">
                <p>{localized(product.description, locale)}</p>
                <dl className="mt-5 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <dt className="uppercase tracking-[0.16em] text-foreground rtl:tracking-normal">{t("gender")}</dt>
                    <dd className="mt-1">{gen(product.gender)}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.16em] text-foreground rtl:tracking-normal">{t("occasion")}</dt>
                    <dd className="mt-1">{product.occasions.map((o) => occ(o)).join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.16em] text-foreground rtl:tracking-normal">{t("intensity")}</dt>
                    <dd className="mt-2">
                      <span className="flex gap-1" role="img" aria-label={`${product.intensity}/5`}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={cn("h-1 w-4", i < product.intensity ? "bg-gold" : "bg-border")} />
                        ))}
                      </span>
                    </dd>
                  </div>
                </dl>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery">
              <AccordionTrigger headingLevel={2} className="py-5 text-xs font-medium uppercase tracking-[0.2em] hover:no-underline rtl:tracking-normal">
                {t("deliveryTitle")}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                <p>{t("deliveryDubai")}</p>
                <p>{t("deliveryUae")}</p>
                <p>{t("deliveryReturns")}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Mobile sticky add-to-cart */}
      <div
        data-sticky-atc
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur-md transition-transform duration-500 ease-[var(--ease-luxe)] md:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden bg-muted">
            <Image src={product.images[0]} alt="" fill sizes="48px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base leading-tight">{name}</p>
            {variant && <Price aed={variant.priceAed} className="text-xs text-muted-foreground" />}
          </div>
          <Button size="sm" className="h-11 px-5" disabled={out} onClick={add} tabIndex={showSticky ? 0 : -1}>
            {out ? t("soldOut") : t("addToCart")}
          </Button>
        </div>
      </div>
    </>
  );
}
