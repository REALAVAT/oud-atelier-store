import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AccountOverview } from "@/components/account/account-overview";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/account">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return buildMetadata({ locale, path: "/account", title: t("title"), description: t("overview"), noIndex: true });
}

export default function AccountPage() {
  return <AccountOverview />;
}
