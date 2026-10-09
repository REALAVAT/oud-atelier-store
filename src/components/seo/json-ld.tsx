import type { Product, Review } from "@/lib/types";
import { getSiteUrl } from "@/lib/env";
import { localeUrl } from "@/lib/seo";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationJsonLd(locale: string) {
  const site = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site}/#organization`,
    name: locale === "ar" ? "عود أتيليه" : "Oud Atelier",
    alternateName: locale === "ar" ? "Oud Atelier" : "عود أتيليه",
    url: localeUrl(locale, ""),
    logo: `${site}/apple-icon`,
    email: "concierge@oudatelier.ae",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Gate Village 4, DIFC",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    sameAs: ["https://www.instagram.com/", "https://ahmadkhajeh.com"],
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function productJsonLd(product: Product, reviews: Review[], locale: string) {
  const url = localeUrl(locale, `/products/${product.slug}`);
  const name = locale === "ar" ? product.name.ar : product.name.en;
  const description = locale === "ar" ? product.description.ar : product.description.en;
  const priceValidUntil = "2027-12-31";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name,
    description,
    image: product.images,
    sku: product.variants[0]?.sku,
    url,
    brand: { "@type": "Brand", name: "Oud Atelier" },
    category: "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "AED",
      lowPrice: Math.min(...product.variants.map((v) => v.priceAed)),
      highPrice: Math.max(...product.variants.map((v) => v.priceAed)),
      offerCount: product.variants.length,
      offers: product.variants.map((v) => ({
        "@type": "Offer",
        sku: v.sku,
        name: `${name} ${v.sizeMl}ml`,
        price: v.priceAed,
        priceCurrency: "AED",
        priceValidUntil,
        url,
        itemCondition: "https://schema.org/NewCondition",
        availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@id": `${getSiteUrl()}/#organization` },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "AE" },
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "AED" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 2, unitCode: "DAY" },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "AE",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 14,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      })),
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    review: reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.createdAt.slice(0, 10),
      name: r.title,
      reviewBody: r.body,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    })),
  };
}
