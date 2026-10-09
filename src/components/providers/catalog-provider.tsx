"use client";

import { createContext, useContext, useMemo } from "react";
import type { StoreSettings } from "@/lib/types";
import { isDemoMode } from "@/lib/env";
import { useDemoDb } from "@/stores/demo-db";
import { useHydrated } from "@/hooks/use-hydrated";
import { toSummary, type ProductSummary } from "@/lib/product-utils";

export type { ProductSummary };

type CatalogValue = { products: ProductSummary[]; settings: StoreSettings };

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({
  products,
  settings,
  children,
}: {
  products: ProductSummary[];
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const demoProducts = useDemoDb((s) => s.products);
  const demoSettings = useDemoDb((s) => s.settings);

  const value = useMemo<CatalogValue>(() => {
    if (isDemoMode && hydrated) {
      return {
        products: demoProducts ? demoProducts.filter((p) => p.status === "active").map(toSummary) : products,
        settings: demoSettings,
      };
    }
    return { products, settings };
  }, [hydrated, demoProducts, demoSettings, products, settings]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}

/** Returns the freshest copy of a product (demo edits and stock changes included). */
export function useLiveProduct<T extends ProductSummary>(product: T): T {
  const hydrated = useHydrated();
  const demoProducts = useDemoDb((s) => s.products);
  return useMemo(() => {
    if (!isDemoMode || !hydrated || !demoProducts) return product;
    const found = demoProducts.find((p) => p.id === product.id);
    return found ? ({ ...product, ...found } as T) : product;
  }, [hydrated, demoProducts, product]);
}
