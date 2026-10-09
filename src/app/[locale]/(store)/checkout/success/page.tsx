import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OrderSuccess } from "@/components/checkout/order-success";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/checkout/success">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "success" });
  return buildMetadata({ locale, path: "/checkout/success", title: t("eyebrow"), description: t("eyebrow"), noIndex: true });
}

export default async function SuccessPage({ params }: PageProps<"/[locale]/checkout/success">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container-luxe">
      <Suspense>
        <OrderSuccess />
      </Suspense>
    </div>
  );
}
