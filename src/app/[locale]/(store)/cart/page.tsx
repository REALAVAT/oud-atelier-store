import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartPage } from "@/components/store/cart-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/cart">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart" });
  return buildMetadata({ locale, path: "/cart", title: t("title"), description: t("emptyBody"), noIndex: true });
}

export default async function Page({ params }: PageProps<"/[locale]/cart">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container-luxe">
      <CartPage />
    </div>
  );
}
