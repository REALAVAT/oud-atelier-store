import { Cormorant_Garamond, Inter, Noto_Naskh_Arabic } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

// Only referenced under [lang="ar"], so preloading it would cost English pages the Arabic file too.
export const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-naskh",
  display: "swap",
  preload: false,
});
