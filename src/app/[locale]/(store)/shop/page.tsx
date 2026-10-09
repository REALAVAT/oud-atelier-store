import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShopBrowser } from "@/components/store/shop-browser";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { buildMetadata } from "@/lib/seo";
export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return buildMetadata({ locale, path: "/shop", title: t("title"), description: t("subtitle") });
}

export default async function ShopPage({ params }: PageProps<"/[locale]/shop">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop");
  const nav = await getTranslations("nav");

  return (
    <div className="container-luxe py-10 lg:py-16">
      <Breadcrumbs
        locale={locale}
        items={[
          { name: nav("home"), href: "/" },
          { name: t("title"), href: "/shop" },
        ]}
      />
      <header className="mb-12 mt-8 max-w-2xl lg:mb-16">
        <h1 className="font-display text-5xl sm:text-6xl">{t("title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </header>
      <ShopBrowser />
    </div>
  );
}
