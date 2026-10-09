"use client";

import { useTranslations } from "next-intl";
import { Heart, MapPin, Package } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import { useSession } from "@/lib/session";
import { usePrefs } from "@/stores/prefs";
import { useHydrated } from "@/hooks/use-hydrated";
import { OrdersList, useMyOrders } from "./orders-list";

export function AccountOverview() {
  const t = useTranslations("account");
  const em = useTranslations("emirates");
  const { user } = useSession();
  const hydrated = useHydrated();
  const wishlist = usePrefs((s) => s.wishlist);
  const { data: orders } = useMyOrders();
  const { data: addresses } = useRepoQuery(() => repo.listAddresses(user!.id), [user?.id], !!user);
  const def = addresses?.find((a) => a.isDefault) ?? addresses?.[0];

  const cards = [
    { href: "/account/orders", icon: Package, label: t("orders"), value: orders ? String(orders.length) : "—" },
    { href: "/account/addresses", icon: MapPin, label: t("addresses"), value: def ? `${def.area}, ${em(def.emirate)}` : t("noAddresses") },
    { href: "/wishlist", icon: Heart, label: t("wishlist"), value: hydrated ? String(wishlist.length) : "—" },
  ];

  return (
    <div className="space-y-12">
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="group border bg-card p-6 transition-colors hover:border-foreground">
            <c.icon className="size-5 text-gold-deep" strokeWidth={1.4} aria-hidden />
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground rtl:tracking-normal">{c.label}</p>
            <p className="mt-1 truncate font-display text-2xl">{c.value}</p>
          </Link>
        ))}
      </div>
      <section aria-labelledby="recent-orders">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id="recent-orders" className="font-display text-3xl">{t("recentOrders")}</h2>
          <Link href="/account/orders" className="link-underline text-sm">{t("orders")}</Link>
        </div>
        <OrdersList limit={3} />
      </section>
    </div>
  );
}
