"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useDemoDb } from "@/stores/demo-db";
import { useHydrated } from "@/hooks/use-hydrated";
import { ProductView } from "./product-view";
import { Button } from "@/components/ui/button";

/** Renders products created in the demo admin (they only exist in this browser). */
export function DemoProductFallback({ slug }: { slug: string }) {
  const t = useTranslations("notFound");
  const locale = useLocale() as "en" | "ar";
  const hydrated = useHydrated();
  const product = useDemoDb((s) => s.products?.find((p) => p.slug === slug));

  if (!hydrated) {
    return <div className="container-luxe min-h-[60vh] py-16" aria-busy="true" />;
  }
  if (!product) {
    return (
      <section className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-5xl">{t("title")}</h1>
        <p className="mt-5 max-w-md text-muted-foreground">{t("body")}</p>
        <Button asChild className="mt-10">
          <Link href="/shop">{t("cta")}</Link>
        </Button>
      </section>
    );
  }
  return (
    <div className="container-luxe py-6 lg:py-12">
      <title>{`${product.name[locale]} | Oud Atelier`}</title>
      <ProductView product={product} />
    </div>
  );
}
