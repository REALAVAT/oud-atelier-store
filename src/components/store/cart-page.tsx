"use client";

import { useTranslations } from "next-intl";
import { Lock, ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/hooks/use-hydrated";
import { useCart, cartCount } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartLine, FreeShippingBar, GiftWrapOption, PromoCodeForm, TotalsRows } from "./cart-parts";

export function CartPage() {
  const t = useTranslations("cart");
  const c = useTranslations("checkout");
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);

  if (!hydrated) {
    return (
      <div className="grid gap-12 py-12 lg:grid-cols-[1fr_400px]" aria-busy="true">
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-32 w-26 rounded-none" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-80 rounded-none" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <span className="flex size-20 items-center justify-center rounded-full border border-gold/50">
          <ShoppingBag className="size-7 text-gold-deep" strokeWidth={1.2} aria-hidden />
        </span>
        <h1 className="font-display text-5xl">{t("empty")}</h1>
        <p className="max-w-sm text-muted-foreground">{t("emptyBody")}</p>
        <Button asChild className="mt-4">
          <Link href="/shop">{t("emptyCta")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16">
      <h1 className="font-display text-5xl sm:text-6xl">
        {t("title")} <span className="text-2xl text-muted-foreground">({cartCount(items)})</span>
      </h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
        <div>
          <div className="border-y py-4">
            <FreeShippingBar />
          </div>
          <ul className="divide-y border-b">
            {items.map((item) => (
              <CartLine key={item.variantId} item={item} />
            ))}
          </ul>
          <div className="mt-8 max-w-md">
            <GiftWrapOption />
          </div>
        </div>
        <aside className="h-fit space-y-6 border bg-card p-6 lg:sticky lg:top-28 lg:p-8" aria-label={c("summary")}>
          <h2 className="font-display text-2xl">{c("summary")}</h2>
          <PromoCodeForm />
          <TotalsRows shippingAed={null} />
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">{t("checkout")}</Link>
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden /> {c("secure")}
          </p>
          <Button asChild variant="link" className="w-full">
            <Link href="/shop">{t("continue")}</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
