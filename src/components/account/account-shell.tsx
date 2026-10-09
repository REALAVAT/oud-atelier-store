"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/session";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("account");
  const auth = useTranslations("auth");
  const nav = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signOut } = useSession();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  const links = [
    { href: "/account", label: t("overview") },
    { href: "/account/orders", label: t("orders") },
    { href: "/account/addresses", label: t("addresses") },
    { href: "/wishlist", label: t("wishlist") },
  ];

  if (!ready || !user) {
    return (
      <div className="container-luxe grid gap-10 py-12 lg:grid-cols-[220px_1fr]" aria-busy="true">
        <Skeleton className="h-48 rounded-none" />
        <Skeleton className="h-96 rounded-none" />
      </div>
    );
  }

  return (
    <div className="container-luxe py-10 lg:py-16">
      <p className="eyebrow">{t("title")}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{t("greeting", { name: user.name.split(" ")[0] })}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <nav aria-label={t("title")} className="no-scrollbar -mx-5 flex gap-1 overflow-x-auto border-b px-5 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:px-0">
          {links.map((l) => {
            const active = l.href === "/account" ? pathname === "/account" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-3 text-sm whitespace-nowrap transition-colors lg:border-b-0 lg:border-s-2 lg:px-4",
                  active ? "border-gold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          {user.role === "admin" && (
            <Link href="/admin" className="shrink-0 border-b-2 border-transparent px-3 py-3 text-sm whitespace-nowrap text-gold-deep lg:border-b-0 lg:border-s-2 lg:px-4">
              {nav("admin")}
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOut();
              toast(auth("signedOut"));
              router.replace("/");
              router.refresh();
            }}
            className="inline-flex shrink-0 items-center gap-2 border-b-2 border-transparent px-3 py-3 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground lg:mt-6 lg:border-b-0 lg:border-s-2 lg:px-4"
          >
            <LogOut className="size-4 rtl:rotate-180" aria-hidden /> {t("signOut")}
          </button>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
