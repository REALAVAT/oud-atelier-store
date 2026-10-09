import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShopBrowser } from "@/components/store/shop-browser";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { getCollection, getCollections } from "@/lib/catalog";
import { localized } from "@/lib/data/seed-products";
import { routing } from "@/i18n/routing";
import { buildMetadata, ogImageUrl } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => getCollections().map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/collections/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = getCollection(slug);
  if (!c) return {};
  const name = localized(c.name, locale);
  return buildMetadata({
    locale,
    path: `/collections/${slug}`,
    title: locale === "ar" ? `مجموعة ${name}` : `${name} Collection`,
    description: localized(c.description, locale),
    image: ogImageUrl({ title: `${c.name.en} Collection`, subtitle: c.description.en }),
  });
}

export default async function CollectionPage({ params }: PageProps<"/[locale]/collections/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const c = getCollection(slug);
  if (!c) notFound();
  const nav = await getTranslations("nav");
  const name = localized(c.name, locale);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-foreground text-background">
        <Image src={c.image} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="container-luxe flex min-h-[340px] flex-col justify-end py-12 lg:min-h-[440px] lg:py-16">
          <Breadcrumbs
            locale={locale}
            className="text-background/70 [&_a:hover]:text-background [&_[aria-current]]:text-background"
            items={[
              { name: nav("home"), href: "/" },
              { name: nav("collections"), href: "/shop" },
              { name, href: `/collections/${slug}` },
            ]}
          />
          <h1 className="mt-6 font-display text-5xl sm:text-7xl">{name}</h1>
          <p className="mt-4 max-w-xl text-background/80">{localized(c.description, locale)}</p>
        </div>
      </section>
      <div className="container-luxe py-12 lg:py-16">
        <ShopBrowser collection={c.slug} />
      </div>
    </>
  );
}
