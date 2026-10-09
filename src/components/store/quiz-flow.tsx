"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCatalog, type ProductSummary } from "@/components/providers/catalog-provider";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Answers = Record<number, string>;

const QUESTIONS = [
  { id: 1, options: ["a", "b", "c", "d"] },
  { id: 2, options: ["a", "b", "c"] },
  { id: 3, options: ["a", "b", "c", "d"] },
  { id: 4, options: ["a", "b", "c"] },
  { id: 5, options: ["a", "b", "c"] },
] as const;

function priceOf(p: ProductSummary) {
  const v = p.variants.find((x) => x.sizeMl === 50) ?? p.variants[0];
  return v?.priceAed ?? 0;
}

export function scoreProduct(p: ProductSummary, a: Answers) {
  let score = 0;
  const fam = { a: ["oud", "amber"], b: ["floral"], c: ["fresh"], d: ["woody", "musk"] }[a[1] as "a"] ?? [];
  if (fam.includes(p.family)) score += 4;
  if (a[2] === "a") score += p.gender === "feminine" ? 2 : p.gender === "unisex" ? 1 : 0;
  if (a[2] === "b") score += p.gender === "masculine" ? 2 : p.gender === "unisex" ? 1 : 0;
  if (a[2] === "c") score += p.gender === "unisex" ? 2 : 0;
  const occ = { a: "day", b: "evening", c: "special", d: "everyday" }[a[3] as "a"];
  if (occ && p.occasions.includes(occ as never)) score += 2;
  const [lo, hi] = { a: [1, 2], b: [3, 3], c: [4, 5] }[a[4] as "a"] ?? [1, 5];
  if (p.intensity >= lo && p.intensity <= hi) score += 2;
  else if (p.intensity === lo - 1 || p.intensity === hi + 1) score += 1;
  const price = priceOf(p);
  if (a[5] === "a") score += price < 450 ? 1 : -1;
  if (a[5] === "b") score += price >= 450 && price <= 700 ? 1 : 0;
  if (a[5] === "c") score += 1;
  return score + p.rating / 10;
}

const MAX_SCORE = 11.5;

export function QuizFlow() {
  const t = useTranslations("quiz");
  const home = useTranslations("home");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const { products } = useCatalog();
  const coffret = products.find((p) => p.slug === "discovery-coffret");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const done = step > QUESTIONS.length;

  const results = useMemo(() => {
    if (!done) return [];
    return products
      .filter((p) => p.collection !== "gift-sets")
      .map((p) => ({ p, score: scoreProduct(p, answers) }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 4);
  }, [done, products, answers]);

  const q = QUESTIONS[step - 1];
  const choose = (opt: string) => {
    setAnswers((s) => ({ ...s, [q.id]: opt }));
    setTimeout(() => setStep((s) => s + 1), reduce ? 0 : 260);
  };

  const anim = reduce
    ? {}
    : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -16 }, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="min-h-[70vh]">
      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <motion.div key="intro" {...anim} className="mx-auto flex max-w-2xl flex-col items-center py-16 text-center lg:py-24">
            <p className="eyebrow">{home("quizEyebrow")}</p>
            <h1 className="mt-5 font-display text-5xl leading-tight sm:text-7xl">{t("title")}</h1>
            <p className="mt-6 max-w-md text-muted-foreground">{t("intro")}</p>
            <Button size="lg" className="mt-10" onClick={() => setStep(1)}>
              {t("start")}
            </Button>
          </motion.div>
        )}

        {q && (
          <motion.div key={`q${q.id}`} {...anim} className="mx-auto max-w-3xl py-12 lg:py-20">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-2 hover:text-foreground">
                <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t("back")}
              </button>
              <span aria-live="polite">{t("step", { current: step, total: QUESTIONS.length })}</span>
            </div>
            <div className="mt-4 h-px bg-border">
              <div className="h-px bg-gold transition-[width] duration-700" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
            </div>
            <h2 className="mt-12 text-center font-display text-4xl sm:text-5xl">{t(`q${q.id}`)}</h2>
            <div className={cn("mt-12 grid gap-3", q.options.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3")} role="radiogroup" aria-label={t(`q${q.id}`)}>
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => choose(opt)}
                    className={cn(
                      "group flex min-h-24 items-center justify-between gap-4 border px-6 py-6 text-start font-display text-2xl transition-colors duration-300",
                      selected ? "border-foreground bg-foreground text-background" : "border-input hover:border-foreground",
                    )}
                  >
                    {t(`q${q.id}${opt}`)}
                    <ArrowRight className="size-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180" aria-hidden />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {done && (
          <motion.div key="results" {...anim} className="py-12 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow">{t("resultsEyebrow")}</p>
              <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t("resultsTitle")}</h1>
              <p className="mt-5 text-muted-foreground">{t("resultsBody")}</p>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {results.map(({ p, score }, i) => (
                <div key={p.id} className="relative">
                  <span className="absolute -top-3 start-3 z-10 bg-gold px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ink rtl:tracking-normal">
                    {t("match", { percent: Math.min(98, Math.round((score / MAX_SCORE) * 100) - i) })}
                  </span>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="mt-14 flex flex-wrap justify-center gap-3">
              {coffret && (
                <Button asChild>
                  <Link href={`/products/${coffret.slug}`}>{locale === "ar" ? coffret.name.ar : coffret.name.en}</Link>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setAnswers({});
                  setStep(1);
                }}
              >
                <RotateCcw /> {t("retake")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
