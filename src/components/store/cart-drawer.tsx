"use client";

import { useLocale, useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart, cartCount } from "@/stores/cart";
import { useHydrated } from "@/hooks/use-hydrated";
import { CartLine, FreeShippingBar, GiftWrapOption, PromoCodeForm, TotalsRows } from "./cart-parts";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const hydrated = useHydrated();
  const open = useCart((s) => s.drawerOpen);
  const setOpen = useCart((s) => s.setDrawerOpen);
  const items = useCart((s) => s.items);
  const list = hydrated ? items : [];
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="w-full gap-0 bg-background p-0 sm:max-w-md data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="font-display text-2xl font-normal">
            {t("title")} <span className="text-base text-muted-foreground">({cartCount(list)})</span>
          </SheetTitle>
          <SheetDescription className="sr-only">{t("items", { count: cartCount(list) })}</SheetDescription>
        </SheetHeader>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full border border-gold/50">
              <ShoppingBag className="size-6 text-gold-deep" strokeWidth={1.3} aria-hidden />
            </span>
            <p className="font-display text-2xl">{t("empty")}</p>
            <p className="text-sm text-muted-foreground">{t("emptyBody")}</p>
            <Button asChild onClick={close}>
              <Link href="/shop">{t("emptyCta")}</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b px-6 py-4">
              <FreeShippingBar />
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y">
                {list.map((item) => (
                  <CartLine key={item.variantId} item={item} compact onNavigate={close} />
                ))}
              </ul>
              <div className="space-y-4 pb-6">
                <GiftWrapOption />
                <PromoCodeForm />
              </div>
            </div>
            <div className="space-y-4 border-t bg-card px-6 py-5">
              <TotalsRows shippingAed={null} />
              <div className="grid gap-2">
                <Button asChild onClick={close}>
                  <Link href="/checkout">{t("checkout")}</Link>
                </Button>
                <Button asChild variant="outline" size="sm" onClick={close}>
                  <Link href="/cart">{t("viewCart")}</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
