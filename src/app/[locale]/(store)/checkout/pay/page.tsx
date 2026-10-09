import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MockPayment } from "@/components/checkout/mock-payment";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/checkout/pay">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return buildMetadata({ locale, path: "/checkout/pay", title: t("mockTitle"), description: t("mockBody"), noIndex: true });
}

export default async function PayPage({ params }: PageProps<"/[locale]/checkout/pay">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container-luxe">
      <MockPayment />
    </div>
  );
}
