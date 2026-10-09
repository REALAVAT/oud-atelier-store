import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  const privatePaths = ["/admin", "/account", "/checkout", "/cart", "/login", "/search", "/wishlist"];
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...["en", "ar"].flatMap((l) => privatePaths.map((p) => `/${l}${p}`))],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
