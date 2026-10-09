"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Heart, Menu, Search, ShoppingBag, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "./logo";
import { CurrencySwitcher, LocaleSwitcher } from "./switchers";
import { useCart, cartCount } from "@/stores/cart";
import { usePrefs } from "@/stores/prefs";
import { useUi } from "@/stores/ui";
import { useHydrated } from "@/hooks/use-hydrated";
import { useSession } from "@/lib/session";
import { COLLECTIONS, localized } from "@/lib/data/seed-products";
import { cn } from "@/lib/utils";
import { useCatalog } from "@/components/providers/catalog-provider";

const NAV = ["oud", "floral", "fresh", "gift-sets"] as const;

const MobileMenu = dynamic(() => import("./mobile-menu"), { ssr: false });

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const { settings } = useCatalog();
  const announcement = localized(settings.announcement, locale);
  const pathname = usePathname();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setDrawerOpen = useCart((s) => s.setDrawerOpen);
  const wishlist = usePrefs((s) => s.wishlist);
  const setSearchOpen = useUi((s) => s.setSearchOpen);
  const { user } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSeen, setMenuSeen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  if (menuOpen && !menuSeen) setMenuSeen(true);
  const count = hydrated ? cartCount(items) : 0;
  const wishCount = hydrated ? wishlist.length : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const accountHref = user ? (user.role === "admin" ? "/admin" : "/account") : "/login";

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {t("skip")}
      </a>
      <div className="bg-foreground text-background">
        <div className="container-luxe flex h-9 items-center justify-between gap-4 text-[0.7rem] tracking-[0.12em] rtl:tracking-normal">
          <p className="truncate text-center flex-1 sm:flex-none sm:text-start uppercase rtl:normal-case">{announcement}</p>
          <div className="hidden items-center gap-5 sm:flex">
            <CurrencySwitcher light />
            <LocaleSwitcher className="text-background hover:text-gold-light text-xs" />
          </div>
        </div>
      </div>
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled ? "border-border bg-background/90 backdrop-blur-md" : "border-transparent bg-background",
        )}
      >
        <div className="container-luxe grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-20">
          <div className="flex items-center gap-1 lg:gap-8">
            <button
              ref={menuButton}
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ms-2 inline-flex size-10 items-center justify-center lg:hidden"
              aria-label={t("menu")}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <Menu className="size-5" strokeWidth={1.4} />
            </button>
            {menuSeen && (
              <MobileMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                accountHref={accountHref}
                isAdmin={user?.role === "admin"}
                returnFocus={menuButton}
              />
            )}

            <nav className="hidden items-center gap-7 lg:flex" aria-label={t("shop")}>
              <div className="group relative">
                <Link
                  href="/shop"
                  className={cn(
                    "link-underline py-2 text-[0.72rem] font-medium uppercase tracking-[0.2em] rtl:text-sm rtl:tracking-normal",
                    pathname.startsWith("/shop") && "text-gold-deep",
                  )}
                >
                  {t("shop")}
                </Link>
                <div className="invisible absolute start-0 top-full z-50 w-[min(92vw,960px)] translate-y-2 pt-6 opacity-0 transition-all duration-500 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="grid grid-cols-[1fr_2.4fr] gap-8 border bg-background p-8 shadow-[0_30px_60px_-30px_rgba(14,13,11,0.35)]">
                    <div className="flex flex-col gap-3">
                      <p className="eyebrow mb-2">{t("collections")}</p>
                      <Link href="/shop" className="font-display text-xl hover:text-gold-deep">{t("allProducts")}</Link>
                      <Link href="/shop?sort=rating" className="font-display text-xl hover:text-gold-deep">{t("bestsellers")}</Link>
                      <Link href="/shop?sort=newest" className="font-display text-xl hover:text-gold-deep">{t("newArrivals")}</Link>
                      <Link href="/quiz" className="font-display text-xl hover:text-gold-deep">{t("quiz")}</Link>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {COLLECTIONS.map((c) => (
                        <Link key={c.slug} href={`/collections/${c.slug}`} className="group/card">
                          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                            <Image
                              src={c.image}
                              alt=""
                              fill
                              sizes="200px"
                              className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover/card:scale-105"
                            />
                          </div>
                          <p className="mt-3 font-display text-lg">{localized(c.name, locale)}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {NAV.slice(0, 3).map((slug) => (
                <Link
                  key={slug}
                  href={`/collections/${slug}`}
                  className={cn(
                    "link-underline py-2 text-[0.72rem] font-medium uppercase tracking-[0.2em] rtl:text-sm rtl:tracking-normal",
                    pathname === `/collections/${slug}` && "text-gold-deep",
                  )}
                >
                  {t(slug)}
                </Link>
              ))}
              <Link
                href="/collections/gift-sets"
                className="link-underline hidden py-2 text-[0.72rem] font-medium uppercase tracking-[0.2em] xl:inline rtl:text-sm rtl:tracking-normal"
              >
                {t("gift-sets")}
              </Link>
              <Link
                href="/quiz"
                className="link-underline hidden whitespace-nowrap py-2 text-[0.72rem] font-medium uppercase tracking-[0.2em] xl:inline rtl:text-sm rtl:tracking-normal"
              >
                {t("quiz")}
              </Link>
            </nav>
          </div>

          <Link href="/" className="justify-self-center">
            <Logo />
          </Link>

          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-10 items-center justify-center hover:text-gold-deep"
              aria-label={t("search")}
            >
              <Search className="size-5" strokeWidth={1.4} />
            </button>
            <Link
              href={accountHref}
              className="hidden size-10 items-center justify-center hover:text-gold-deep sm:inline-flex"
              aria-label={user?.role === "admin" ? t("admin") : t("account")}
            >
              <User className="size-5" strokeWidth={1.4} />
            </Link>
            <Link
              href="/wishlist"
              className="relative hidden size-10 items-center justify-center hover:text-gold-deep sm:inline-flex"
              aria-label={`${t("wishlist")} (${wishCount})`}
            >
              <Heart className="size-5" strokeWidth={1.4} />
              {wishCount > 0 && (
                <span className="absolute end-1 top-1 flex size-4 items-center justify-center rounded-full bg-gold text-[0.6rem] font-semibold text-ink">
                  {wishCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative -me-2 inline-flex size-10 items-center justify-center hover:text-gold-deep"
              aria-label={`${t("cart")} (${count})`}
            >
              <ShoppingBag className="size-5" strokeWidth={1.4} />
              {count > 0 && (
                <span className="absolute end-1 top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[0.6rem] font-semibold text-background">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
