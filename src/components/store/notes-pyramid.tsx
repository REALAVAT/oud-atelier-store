import { getLocale, getTranslations } from "next-intl/server";
import { noteLabel } from "@/lib/data/notes";

export async function NotesPyramid({ notes }: { notes: { top: string[]; heart: string[]; base: string[] } }) {
  const t = await getTranslations("product");
  const locale = await getLocale();
  const tiers = [
    { key: "top", label: t("top"), hint: t("topHint"), items: notes.top, width: "w-[46%]" },
    { key: "heart", label: t("heart"), hint: t("heartHint"), items: notes.heart, width: "w-[72%]" },
    { key: "base", label: t("base"), hint: t("baseHint"), items: notes.base, width: "w-full" },
  ];

  return (
    <section className="bg-foreground py-20 text-background lg:py-28" aria-labelledby="notes-title">
      <div className="container-luxe">
        <div className="text-center">
          <p className="eyebrow !text-gold-light">{t("notes")}</p>
          <h2 id="notes-title" className="mt-4 font-display text-4xl sm:text-5xl">
            {t("top")} · {t("heart")} · {t("base")}
          </h2>
        </div>
        <ol className="mx-auto mt-14 flex max-w-3xl flex-col items-center gap-3">
          {tiers.map((tier, i) => (
            <li
              key={tier.key}
              className={`${tier.width} border border-gold/40 bg-gradient-to-b from-white/[0.04] to-transparent px-4 py-6 text-center sm:px-8`}
              style={{ clipPath: i === 0 ? "polygon(12% 0, 88% 0, 100% 100%, 0 100%)" : undefined }}
            >
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold-light rtl:tracking-normal rtl:text-xs">{tier.label}</p>
              <p className="mt-2 font-display text-xl sm:text-2xl">{tier.items.map((n) => noteLabel(n, locale)).join(" · ")}</p>
              <p className="mt-2 text-xs text-background/60">{tier.hint}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
