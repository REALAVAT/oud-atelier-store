import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { QuizFlow } from "@/components/store/quiz-flow";
import { buildMetadata } from "@/lib/seo";
export async function generateMetadata({ params }: PageProps<"/[locale]/quiz">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quiz" });
  return buildMetadata({ locale, path: "/quiz", title: t("title"), description: t("intro") });
}

export default async function QuizPage({ params }: PageProps<"/[locale]/quiz">) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container-luxe">
      <QuizFlow />
    </div>
  );
}
