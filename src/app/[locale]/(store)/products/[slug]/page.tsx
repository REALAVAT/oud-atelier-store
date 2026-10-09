import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductBySlug, getProducts, getRelated, getReviews } from "@/lib/catalog";
import { isDemoMode } from "@/lib/env";
import { localized } from "@/lib/data/seed-products";
import { routing } from "@/i18n/routing";
import { buildMetadata, ogImageUrl } from "@/lib/seo";
import { toSummary } from "@/lib/product-utils";
import { ProductView } from "@/components/store/product-view";
import { NotesPyramid } from "@/components/store/notes-pyramid";
import { ProductReviews } from "@/components/store/product-reviews";
import { ProductCard } from "@/components/store/product-card";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { DemoProductFallback } from "@/components/store/demo-product-fallback";
import { JsonLd, productJsonLd } from "@/components/seo/json-ld";

export async function generateStaticParams() {
  const products = await getProducts();
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { robots: { index: false } };
  return {
    ...buildMetadata({
      locale,
      path: `/products/${slug}`,
      title: localized(product.seo.title, locale),
      description: localized(product.seo.description, locale),
      image: ogImageUrl({ product: product.slug }),
    }),
    title: { absolute: localized(product.seo.title, locale) },
  };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) {
    if (isDemoMode) return <DemoProductFallback slug={slug} />;
    notFound();
  }
  const [reviews, related] = await Promise.all([getReviews(product.id), getRelated(product)]);
  const t = await getTranslations("product");
  const nav = await getTranslations("nav");
  const name = localized(product.name, locale);

  return (
    <>
      <JsonLd data={productJsonLd(product, reviews, locale)} />
      <div className="container-luxe py-6 lg:py-12">
        <ProductView
          product={product}
          breadcrumbs={
            <Breadcrumbs
              locale={locale}
              items={[
                { name: nav("home"), href: "/" },
                { name: nav(product.collection), href: `/collections/${product.collection}` },
                { name, href: `/products/${product.slug}` },
              ]}
            />
          }
        />
      </div>
      <div className="mt-16 lg:mt-24">
        <NotesPyramid notes={product.notes} />
      </div>
      <ProductReviews productId={product.id} initial={reviews} rating={product.rating} reviewCount={product.reviewCount} />
      <section className="border-t bg-card py-20 lg:py-28" aria-labelledby="related-title">
        <div className="container-luxe">
          <h2 id="related-title" className="font-display text-4xl sm:text-5xl">{t("youMayAlsoLike")}</h2>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={toSummary(p)} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
