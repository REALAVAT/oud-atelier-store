"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { usePrefs } from "@/stores/prefs";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCatalog } from "@/components/providers/catalog-provider";
import { ProductCard, ProductCardSkeleton } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";

export function WishlistGrid() {
  const t = useTranslations("account");
  const cart = useTranslations("cart");
  const hydrated = useHydrated();
  const ids = usePrefs((s) => s.wishlist);
  const { products } = useCatalog();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter((p) => !!p);

  return (
    <div className="py-10 lg:py-16">
      <h1 className="font-display text-5xl sm:text-6xl">{t("wishlist")}</h1>
      {!hydrated ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 border border-dashed px-6 py-20 text-center">
          <Heart className="size-8 text-gold-deep" strokeWidth={1.2} aria-hidden />
          <p className="font-display text-3xl">{t("emptyWishlist")}</p>
          <p className="text-sm text-muted-foreground">{t("emptyWishlistBody")}</p>
          <Button asChild className="mt-2">
            <Link href="/shop">{cart("emptyCta")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} headingLevel={2} />)}
        </div>
      )}
    </div>
  );
}
