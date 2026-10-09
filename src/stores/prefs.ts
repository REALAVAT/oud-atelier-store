"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Currency } from "@/lib/currency";

type PrefsState = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  newsletterDismissed: boolean;
  dismissNewsletter: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  recentSearches: string[];
  pushSearch: (q: string) => void;
};

export const usePrefs = create<PrefsState>()(
  persist(
    (set, get) => ({
      currency: "AED",
      setCurrency: (currency) => set({ currency }),
      newsletterDismissed: false,
      dismissNewsletter: () => set({ newsletterDismissed: true }),
      wishlist: [],
      toggleWishlist: (id) => {
        const has = get().wishlist.includes(id);
        set({ wishlist: has ? get().wishlist.filter((w) => w !== id) : [...get().wishlist, id] });
        return !has;
      },
      recentSearches: [],
      pushSearch: (q) =>
        set((s) => ({
          recentSearches: [q, ...s.recentSearches.filter((r) => r !== q)].slice(0, 5),
        })),
    }),
    { name: "oud-atelier-prefs", storage: createJSONStorage(() => localStorage) },
  ),
);
