import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

type BuildOpts = {
  locale: string;
  /** Path without locale prefix, e.g. "/shop" or "" for home. */
  path: string;
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
};

export function localeUrl(locale: string, path: string) {
  return `${getSiteUrl()}/${locale}${path}`;
}

export function ogImageUrl(params: Record<string, string>) {
  return `${getSiteUrl()}/api/og?${new URLSearchParams(params).toString()}`;
}

export function buildMetadata({ locale, path, title, description, image: explicit, noIndex, type = "website" }: BuildOpts): Metadata {
  const url = localeUrl(locale, path);
  const image = explicit ?? (noIndex ? undefined : ogImageUrl({ title: title.split(" | ")[0] }));
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: localeUrl("en", path),
        ar: localeUrl("ar", path),
        "x-default": localeUrl("en", path),
      },
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: locale === "ar" ? "عود أتيليه" : "Oud Atelier",
      locale: locale === "ar" ? "ar_AE" : "en_AE",
      alternateLocale: locale === "ar" ? ["en_AE"] : ["ar_AE"],
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
