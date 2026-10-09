import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, Gift, Sparkles, Truck, Droplet } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCollections, getFeaturedReviews, getProducts } from "@/lib/catalog";
import { localized } from "@/lib/data/seed-products";
import { IMG, unsplash } from "@/lib/data/images";
import { toSummary } from "@/lib/product-utils";
import { ProductCard } from "@/components/store/product-card";
import { RatingStars } from "@/components/store/rating-stars";
import { NewsletterForm } from "@/components/store/newsletter-form";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...buildMetadata({ locale, path: "", title: t("title"), description: t("description") }),
    title: { absolute: t("title") },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const [products, reviews] = await Promise.all([getProducts(), getFeaturedReviews(3)]);
  const collections = getCollections();
  const bestsellers = products.filter((p) => p.bestseller).slice(0, 4);
  const productById = new Map(products.map((p) => [p.id, p]));

  const perks = [
    { icon: Truck, label: t("perkDelivery") },
    { icon: Gift, label: t("perkWrap") },
    { icon: Droplet, label: t("perkSamples") },
    { icon: Sparkles, label: t("perkAuthentic") },
  ];

  const insta = [IMG.goldEucalyptus, IMG.noirRoses, IMG.amberOils, IMG.candleWarm, IMG.pinkPetals, IMG.flatlay];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-foreground text-background">
        <div className="relative h-[calc(100svh-6.25rem)] max-h-[900px] min-h-[560px] lg:h-[calc(100svh-7.25rem)]">
          <Image
            src={unsplash("handsOil", 2400)}
            alt=""
            fill
            priority
            fetchPriority="high"
            quality={60}
            sizes="100vw"
            className="animate-[heroZoom_14s_ease-out_forwards] object-cover object-[70%_center] opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent rtl:bg-gradient-to-l" />
          <div className="container-luxe relative flex h-full flex-col justify-end pb-16 sm:pb-20 lg:pb-28">
            <div className="max-w-2xl animate-[heroIn_1.4s_cubic-bezier(0.22,1,0.36,1)_both]">
              <p className="eyebrow !text-gold-light">{t("heroEyebrow")}</p>
              <h1 className="mt-5 font-display text-[3.1rem] leading-[0.95] sm:text-7xl lg:text-[6.5rem]">
                {t("heroTitle")}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-background/80 sm:text-lg">
                {t("heroSubtitle")}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="lg">
                  <Link href="/collections/oud">{t("heroCta")}</Link>
                </Button>
                <Button asChild variant="outline-light" size="lg">
                  <Link href="/quiz">{t("heroCtaSecondary")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-b bg-background">
        <ul className="container-luxe grid grid-cols-2 gap-y-5 py-6 lg:grid-cols-4">
          {perks.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center justify-center gap-3 text-center text-xs sm:text-sm">
              <Icon className="size-4 shrink-0 text-gold-deep" strokeWidth={1.4} aria-hidden />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Collections */}
      <section className="container-luxe py-20 lg:py-32" aria-labelledby="collections-title">
        <Reveal className="flex flex-col items-center text-center">
          <p className="eyebrow">{t("collectionsEyebrow")}</p>
          <h2 id="collections-title" className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl">
            {t("collectionsTitle")}
          </h2>
        </Reveal>
        <Stagger className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {collections.map((c, i) => (
            <StaggerItem key={c.slug}>
              <Link href={`/collections/${c.slug}`} className="group relative block overflow-hidden bg-foreground">
                <div className={`relative ${i % 2 === 1 ? "aspect-[3/4] lg:mt-12" : "aspect-[3/4]"}`}>
                  <Image
                    src={c.image}
                    alt={localized(c.name, locale)}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover opacity-90 transition-transform duration-[1.6s] ease-[var(--ease-luxe)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-background sm:p-7">
                    <h3 className="font-display text-3xl sm:text-4xl">{localized(c.name, locale)}</h3>
                    <p className="mt-2 hidden text-sm text-background/80 sm:block">{localized(c.description, locale)}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-gold-light rtl:tracking-normal">
                      {nav("megaCta")} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Best sellers */}
      <section className="bg-card py-20 lg:py-28" aria-labelledby="bestsellers-title">
        <div className="container-luxe">
          <Reveal className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">{t("bestsellersEyebrow")}</p>
              <h2 id="bestsellers-title" className="mt-4 font-display text-4xl sm:text-5xl">
                {t("bestsellersTitle")}
              </h2>
            </div>
            <Link
              href="/shop?sort=rating"
              className="link-underline hidden pb-1 text-xs font-medium uppercase tracking-[0.2em] sm:inline rtl:tracking-normal"
            >
              {t("viewAll")}
            </Link>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={toSummary(p)} />
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href="/shop?sort=rating">{t("viewAll")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="scroll-mt-24 py-20 lg:py-32" aria-labelledby="story-title">
        <div className="container-luxe grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image src={IMG.labGlass} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-8 end-4 hidden w-44 border-8 border-background bg-muted sm:block lg:-end-12 lg:w-56">
              <div className="relative aspect-square">
                <Image src={IMG.dubai} alt="" fill sizes="224px" className="object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="eyebrow">{t("storyEyebrow")}</p>
            <h2 id="story-title" className="mt-4 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
              {t("storyTitle")}
            </h2>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">{t("storyBody")}</p>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t pt-8">
              {[
                ["18", t("statYears")],
                ["64", t("statIngredients")],
                ["27k", t("statClients")],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-display text-4xl text-gold-deep lg:text-5xl">{value}</dd>
                  <dd className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground rtl:tracking-normal">{label}</dd>
                </div>
              ))}
            </dl>
            <Button asChild variant="outline" className="mt-10">
              <Link href="/shop">{t("storyCta")}</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Quiz teaser */}
      <section className="relative isolate overflow-hidden bg-foreground text-background" aria-labelledby="quiz-title">
        <Image src={IMG.vials} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-50" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 to-black/30 rtl:bg-gradient-to-l" />
        <div className="container-luxe py-24 lg:py-36">
          <Reveal className="max-w-xl">
            <p className="eyebrow !text-gold-light">{t("quizEyebrow")}</p>
            <h2 id="quiz-title" className="mt-4 font-display text-4xl leading-tight sm:text-6xl">
              {t("quizTitle")}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-background/80 lg:text-lg">{t("quizBody")}</p>
            <Button asChild variant="gold" size="lg" className="mt-10">
              <Link href="/quiz">{t("quizCta")}</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* Reviews */}
      <section className="container-luxe py-20 lg:py-32" aria-labelledby="reviews-title">
        <Reveal className="text-center">
          <p className="eyebrow">{t("reviewsEyebrow")}</p>
          <h2 id="reviews-title" className="mt-4 font-display text-4xl sm:text-5xl">
            {t("reviewsTitle")}
          </h2>
        </Reveal>
        <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => {
            const p = productById.get(r.productId);
            return (
              <StaggerItem key={r.id}>
                <figure className="flex h-full flex-col border bg-card p-8 lg:p-10">
                  <RatingStars rating={r.rating} size={14} />
                  <blockquote className="mt-6 flex-1 font-display text-2xl leading-snug">
                    “{locale === "ar" && r.bodyAr ? r.bodyAr : r.body}”
                  </blockquote>
                  <figcaption className="mt-8 border-t pt-5 text-sm">
                    <span className="font-medium">{r.author}</span>
                    <span className="text-muted-foreground"> · {r.location}</span>
                    {p && (
                      <Link href={`/products/${p.slug}`} className="mt-1 block text-xs text-gold-deep hover:underline">
                        {localized(p.name, locale)}
                      </Link>
                    )}
                  </figcaption>
                </figure>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* Newsletter */}
      <section className="bg-secondary" aria-labelledby="newsletter-title">
        <div className="container-luxe grid grid-cols-1 items-center gap-10 py-20 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <p className="eyebrow">{t("newsletterEyebrow")}</p>
            <h2 id="newsletter-title" className="mt-4 font-display text-4xl sm:text-5xl">
              {t("newsletterTitle")}
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">{t("newsletterBody")}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <NewsletterForm />
          </Reveal>
        </div>
      </section>

      {/* Instagram */}
      <section className="py-20 lg:py-28" aria-labelledby="insta-title">
        <div className="container-luxe flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow" dir="ltr">{t("instagramEyebrow")}</p>
            <h2 id="insta-title" className="mt-4 font-display text-4xl sm:text-5xl">
              {t("instagramTitle")}
            </h2>
          </div>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline pb-1 text-xs font-medium uppercase tracking-[0.2em] rtl:tracking-normal"
          >
            {t("instagramFollow")}
          </a>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-1 sm:gap-2 lg:grid-cols-6">
          {insta.map((src, i) => (
            <a
              key={src}
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden bg-muted"
              aria-label={`${t("instagramFollow")} ${i + 1}`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="(min-width: 1024px) 16vw, 33vw"
                className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/25" />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
