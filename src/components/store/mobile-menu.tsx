"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "./logo";
import { CurrencySwitcher, LocaleSwitcher } from "./switchers";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const NAV = ["oud", "floral", "fresh", "gift-sets"] as const;

export default function MobileMenu({
  open,
  onOpenChange,
  accountHref,
  isAdmin,
  returnFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountHref: string;
  isAdmin: boolean;
  returnFocus: React.RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={locale === "ar" ? "right" : "left"}
        className="w-[88%] max-w-sm bg-background p-0"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus.current?.focus();
        }}
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <Logo className="items-start" />
        </SheetHeader>
        <nav className="flex flex-col px-6 py-4" aria-label={t("menu")}>
          <Link href="/shop" onClick={close} className="border-b py-4 font-display text-2xl">
            {t("allProducts")}
          </Link>
          {NAV.map((slug) => (
            <Link key={slug} href={`/collections/${slug}`} onClick={close} className="border-b py-4 font-display text-2xl">
              {t(slug)}
            </Link>
          ))}
          <Link href="/quiz" onClick={close} className="border-b py-4 font-display text-2xl">
            {t("quiz")}
          </Link>
          <Link href={accountHref} onClick={close} className="border-b py-4 text-sm">
            {isAdmin ? t("admin") : t("account")}
          </Link>
          <Link href="/wishlist" onClick={close} className="border-b py-4 text-sm">
            {t("wishlist")}
          </Link>
          <div className="flex items-center justify-between py-5">
            <CurrencySwitcher />
            <LocaleSwitcher />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
