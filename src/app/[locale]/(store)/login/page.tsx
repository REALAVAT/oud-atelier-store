import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginPanel } from "@/components/account/login-panel";
import { buildMetadata } from "@/lib/seo";
import { unsplash } from "@/lib/data/images";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return buildMetadata({ locale, path: "/login", title: t("signInTitle"), description: t("signInBody"), noIndex: true });
}

export default async function LoginPage({ params }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="grid min-h-[calc(100svh-8rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image src={unsplash("goldLeaves", 1400)} alt="" fill sizes="50vw" className="object-cover" quality={75} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
      </div>
      <div className="flex min-w-0 items-center px-5 py-14 sm:px-10 lg:px-16">
        <Suspense>
          <LoginPanel />
        </Suspense>
      </div>
    </div>
  );
}
