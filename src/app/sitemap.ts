import type { MetadataRoute } from "next";
import { getCollections, getProducts } from "@/lib/catalog";
import { getSiteUrl } from "@/lib/env";
import { routing } from "@/i18n/routing";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const products = await getProducts();
  const now = new Date();

  const entry = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly", lastModified = now) =>
    routing.locales.map((locale) => ({
      url: `${site}/${locale}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries([
          ...routing.locales.map((l) => [l, `${site}/${l}${path}`]),
          ["x-default", `${site}/en${path}`],
        ]),
      },
    }));

  return [
    ...entry("", 1, "daily"),
    ...entry("/shop", 0.9, "daily"),
    ...entry("/quiz", 0.6, "monthly"),
    ...getCollections().flatMap((c) => entry(`/collections/${c.slug}`, 0.8, "weekly")),
    ...products.flatMap((p) => entry(`/products/${p.slug}`, 0.8, "weekly", new Date(p.createdAt))),
  ];
}
