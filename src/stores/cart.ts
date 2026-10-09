"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DiscountCode, Localized } from "@/lib/types";

export type CartItem = {
  productId: string;
  variantId: string;
  slug: string;
  name: Localized;
  image: string;
  sizeMl: number;
  label?: Localized;
  priceAed: number;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  discount: DiscountCode | null;
  giftWrap: boolean;
  giftMessage: string;
  drawerOpen: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setDiscount: (d: DiscountCode | null) => void;
  setGiftWrap: (value: boolean) => void;
  setGiftMessage: (value: string) => void;
  setDrawerOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      discount: null,
      giftWrap: false,
      giftMessage: "",
      drawerOpen: false,
      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, item.maxStock || 99) }
                  : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity: Math.min(quantity, item.maxStock || 99) }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.variantId === variantId
                ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxStock || 99)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [], discount: null, giftWrap: false, giftMessage: "" }),
      setDiscount: (discount) => set({ discount }),
      setGiftWrap: (giftWrap) => set({ giftWrap }),
      setGiftMessage: (giftMessage) => set({ giftMessage }),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
    }),
    {
      name: "oud-atelier-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ drawerOpen: _drawerOpen, ...rest }) => rest,
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((s, i) => s + i.quantity, 0);
}
