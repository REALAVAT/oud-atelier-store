import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { WishlistGrid } from "@/components/account/wishlist-grid";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/wishlist">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return buildMetadata({ locale, path: "/wishlist", title: t("wishlist"), description: t("emptyWishlistBody"), noIndex: true });
}

export default async function WishlistPage({ params }: PageProps<"/[locale]/wishlist">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container-luxe">
      <WishlistGrid />
    </div>
  );
}
