import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SearchResults } from "@/components/store/search-results";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/search">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return buildMetadata({ locale, path: "/search", title: t("title"), description: t("placeholder"), noIndex: true });
}

export default async function SearchPage({ params }: PageProps<"/[locale]/search">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container-luxe min-h-[60vh]">
      <Suspense>
        <SearchResults />
      </Suspense>
    </div>
  );
}
