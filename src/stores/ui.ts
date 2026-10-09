"use client";

import { create } from "zustand";

type UiState = {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickViewId: string | null;
  setQuickViewId: (id: string | null) => void;
};

export const useUi = create<UiState>((set) => ({
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  quickViewId: null,
  setQuickViewId: (quickViewId) => set({ quickViewId }),
}));
