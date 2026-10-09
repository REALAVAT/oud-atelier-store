import { setRequestLocale } from "next-intl/server";
import { getProducts, getSettings } from "@/lib/catalog";
import { CatalogProvider } from "@/components/providers/catalog-provider";
import { toSummary } from "@/lib/product-utils";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { LazyOverlays } from "@/components/store/lazy-overlays";
import { WhatsAppButton } from "@/components/store/whatsapp-button";
import { JsonLd, organizationJsonLd } from "@/components/seo/json-ld";

export const revalidate = 300;

export default async function StoreLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);

  return (
    <CatalogProvider products={products.map(toSummary)} settings={settings}>
      <JsonLd data={organizationJsonLd(locale)} />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <LazyOverlays />
      <WhatsAppButton />
    </CatalogProvider>
  );
}
