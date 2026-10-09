import type { Localized } from "@/lib/types";

export const NOTES: Record<string, Localized> = {
  saffron: { en: "Saffron", ar: "زعفران" },
  "pink-pepper": { en: "Pink Pepper", ar: "فلفل وردي" },
  bergamot: { en: "Bergamot", ar: "برغموت" },
  cardamom: { en: "Cardamom", ar: "هيل" },
  lime: { en: "Lime", ar: "ليمون" },
  mandarin: { en: "Mandarin", ar: "يوسفي" },
  neroli: { en: "Neroli", ar: "نيرولي" },
  "sea-salt": { en: "Sea Salt", ar: "ملح البحر" },
  "green-tea": { en: "Green Tea", ar: "شاي أخضر" },
  fig: { en: "Fig", ar: "تين" },
  mint: { en: "Mint", ar: "نعناع" },
  grapefruit: { en: "Grapefruit", ar: "جريب فروت" },
  plum: { en: "Plum", ar: "برقوق" },
  raspberry: { en: "Raspberry", ar: "توت العليق" },
  cinnamon: { en: "Cinnamon", ar: "قرفة" },
  rose: { en: "Taif Rose", ar: "ورد طائفي" },
  jasmine: { en: "Jasmine", ar: "ياسمين" },
  "orange-blossom": { en: "Orange Blossom", ar: "زهر البرتقال" },
  peony: { en: "Peony", ar: "فاوانيا" },
  tuberose: { en: "Tuberose", ar: "مسك الروم" },
  iris: { en: "Iris", ar: "سوسن" },
  lavender: { en: "Lavender", ar: "خزامى" },
  geranium: { en: "Geranium", ar: "إبرة الراعي" },
  incense: { en: "Frankincense", ar: "لبان" },
  oud: { en: "Oud", ar: "عود" },
  "cambodian-oud": { en: "Cambodian Oud", ar: "عود كمبودي" },
  amber: { en: "Amber", ar: "عنبر" },
  leather: { en: "Leather", ar: "جلد" },
  sandalwood: { en: "Sandalwood", ar: "صندل" },
  vetiver: { en: "Vetiver", ar: "نجيل الهند" },
  patchouli: { en: "Patchouli", ar: "باتشولي" },
  musk: { en: "White Musk", ar: "مسك أبيض" },
  "black-musk": { en: "Black Musk", ar: "مسك أسود" },
  vanilla: { en: "Vanilla", ar: "فانيليا" },
  tonka: { en: "Tonka Bean", ar: "حبوب التونكا" },
  cedar: { en: "Cedarwood", ar: "خشب الأرز" },
  benzoin: { en: "Benzoin", ar: "جاوي" },
  labdanum: { en: "Labdanum", ar: "لادن" },
  ambergris: { en: "Ambergris", ar: "عنبر رمادي" },
  honey: { en: "Honey", ar: "عسل" },
  "tobacco-leaf": { en: "Tobacco Leaf", ar: "أوراق التبغ" },
  driftwood: { en: "Driftwood", ar: "خشب البحر" },
};

export function noteLabel(key: string, locale: string) {
  const n = NOTES[key];
  if (!n) return key;
  return locale === "ar" ? n.ar : n.en;
}
