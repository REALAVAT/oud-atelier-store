import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrdersList } from "@/components/account/orders-list";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/orders">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return buildMetadata({ locale, path: "/account/orders", title: t("orders"), description: t("orders"), noIndex: true });
}

export default async function OrdersPage({ params }: PageProps<"/[locale]/account/orders">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return (
    <div>
      <h2 className="mb-6 font-display text-3xl">{t("orders")}</h2>
      <OrdersList />
    </div>
  );
}
