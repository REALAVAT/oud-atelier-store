import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, isRtl } from "@/i18n/routing";
import { cormorant, inter, naskh } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";
import { SessionProvider } from "@/lib/session";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0e0d0b",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    ...buildMetadata({ locale, path: "", title: t("title"), description: t("description") }),
    metadataBase: new URL(getSiteUrl()),
    title: { default: t("title"), template: `%s · ${t("siteName")}` },
    applicationName: t("siteName"),
    keywords: t("keywords"),
    authors: [{ name: "Ahmad Khajeh", url: "https://ahmadkhajeh.com" }],
    creator: "Ahmad Khajeh",
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const rtl = isRtl(locale);
  const common = await getTranslations("common");

  return (
    <html
      lang={locale}
      dir={rtl ? "rtl" : "ltr"}
      className={cn(inter.variable, cormorant.variable, rtl && naskh.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-dvh font-sans">
        <NextIntlClientProvider>
          <SessionProvider>
            {children}
            <Toaster
              position={rtl ? "bottom-left" : "bottom-right"}
              dir={rtl ? "rtl" : "ltr"}
              containerAriaLabel={common("notifications")}
            />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
