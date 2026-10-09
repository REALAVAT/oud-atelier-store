import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AddressBook } from "@/components/account/address-book";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/account/addresses">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return buildMetadata({ locale, path: "/account/addresses", title: t("addresses"), description: t("noAddressesBody"), noIndex: true });
}

export default function AddressesPage() {
  return <AddressBook />;
}
