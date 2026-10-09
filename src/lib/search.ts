import { NOTES } from "@/lib/data/notes";

type Searchable = {
  name: { en: string; ar: string };
  tagline: { en: string; ar: string };
  collection: string;
  family: string;
  notes: { top: string[]; heart: string[]; base: string[] };
  rating: number;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/[\u0300-\u036f]/g, "");
}

export function searchProducts<T extends Searchable>(products: T[], query: string): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products
    .map((p) => {
      const notes = [...p.notes.top, ...p.notes.heart, ...p.notes.base].flatMap((n) => [
        n,
        NOTES[n]?.en ?? "",
        NOTES[n]?.ar ?? "",
      ]);
      const name = normalize(`${p.name.en} ${p.name.ar}`);
      const haystack = normalize(
        [p.tagline.en, p.tagline.ar, p.collection, p.family, ...notes].join(" "),
      );
      let score = 0;
      for (const term of terms) {
        if (name.includes(term)) score += 5;
        else if (haystack.includes(term)) score += 2;
        else return { p, score: -1 };
      }
      return { p, score: score + p.rating / 10 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
