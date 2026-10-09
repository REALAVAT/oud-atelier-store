"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  RotateCcw,
  Settings,
  ShoppingCart,
  TicketPercent,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/session";
import { isDemoMode } from "@/lib/env";
import { useDemoDb } from "@/stores/demo-db";
import { Logo } from "@/components/store/logo";
import { LocaleSwitcher } from "@/components/store/switchers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/products", key: "products", icon: Package },
  { href: "/admin/orders", key: "orders", icon: ShoppingCart },
  { href: "/admin/customers", key: "customers", icon: Users },
  { href: "/admin/discounts", key: "discounts", icon: TicketPercent },
  { href: "/admin/settings", key: "settings", icon: Settings },
  { href: "/admin/emails", key: "emails", icon: Mail },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  return (
    <nav aria-label={t("title")} className="flex flex-col gap-0.5">
      {NAV.map(({ href, key, icon: Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
              active ? "bg-background/10 text-background" : "text-background/60 hover:bg-background/5 hover:text-background",
            )}
          >
            <Icon className={cn("size-4", active && "text-gold-light")} aria-hidden />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const common = useTranslations("common");
  const accountT = useTranslations("account");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, signOut } = useSession();
  const reset = useDemoDb((s) => s.reset);
  const [menuOpen, setMenuOpen] = useState(false);
  const allowed = ready && user?.role === "admin";

  useEffect(() => {
    if (ready && user?.role !== "admin") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col gap-8 bg-ink px-4 py-6 text-background">
      <Link href="/admin" onClick={onNavigate} className="px-3">
        <Logo light className="items-start [&>span:first-child]:text-lg [&>span:first-child]:tracking-[0.28em]" />
        <span className="mt-3 block text-[0.65rem] uppercase tracking-[0.3em] text-background/50 rtl:tracking-normal">{t("title")}</span>
      </Link>
      <NavLinks onNavigate={onNavigate} />
      <div className="mt-auto space-y-1 border-t border-background/10 pt-4">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm text-background/60 hover:text-background">
          <ExternalLink className="size-4" aria-hidden /> {t("backToStore")}
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.replace("/");
            router.refresh();
          }}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-background/60 hover:text-background"
        >
          <LogOut className="size-4 rtl:rotate-180" aria-hidden /> {accountT("signOut")}
        </button>
      </div>
    </div>
  );

  if (!allowed) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6" aria-busy="true">
        <Skeleton className="h-64 w-full max-w-3xl rounded-none" />
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#f3efe7] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-svh lg:block">{sidebar()}</aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side={locale === "ar" ? "right" : "left"} className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">{t("title")}</SheetTitle>
          {sidebar(() => setMenuOpen(false))}
        </SheetContent>
      </Sheet>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon-sm" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label={t("title")}>
            <Menu />
          </Button>
          {isDemoMode && (
            <span className="hidden shrink-0 whitespace-nowrap border border-gold/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.16em] text-gold-deep sm:inline rtl:tracking-normal">
              {common("demoBadge")}
            </span>
          )}
          <p className="hidden truncate text-xs text-muted-foreground md:block">{isDemoMode ? common("demoBanner") : null}</p>
          <div className="ms-auto flex items-center gap-2">
            {isDemoMode && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  if (!window.confirm(common("confirm"))) return;
                  reset();
                  toast.success(common("resetDone"));
                }}
              >
                <RotateCcw aria-hidden /> <span className="hidden sm:inline">{common("reset")}</span>
              </Button>
            )}
            <LocaleSwitcher />
            <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
          </div>
        </header>
        <main id="main" className="px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
