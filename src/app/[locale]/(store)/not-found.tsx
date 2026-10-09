import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  return (
    <section className="container-luxe flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t("title")}</h1>
      <p className="mt-5 max-w-md text-muted-foreground">{t("body")}</p>
      <Button asChild className="mt-10">
        <Link href="/">{t("cta")}</Link>
      </Button>
    </section>
  );
}
