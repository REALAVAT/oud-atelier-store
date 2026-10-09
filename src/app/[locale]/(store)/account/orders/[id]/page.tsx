import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderDetail } from "@/components/account/order-detail";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/orders/[id]">): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return buildMetadata({ locale, path: `/account/orders/${id}`, title: t("order"), description: t("timeline"), noIndex: true });
}

export default async function OrderPage({ params }: PageProps<"/[locale]/account/orders/[id]">) {
  const { id } = await params;
  return <OrderDetail id={decodeURIComponent(id)} />;
}
