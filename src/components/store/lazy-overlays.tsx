"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useCart } from "@/stores/cart";
import { useUi } from "@/stores/ui";

const CartDrawer = dynamic(() => import("./cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const SearchDialog = dynamic(() => import("./search-dialog").then((m) => m.SearchDialog), { ssr: false });
const QuickView = dynamic(() => import("./quick-view").then((m) => m.QuickView), { ssr: false });

/** Overlays load on first open and stay mounted so their close animations still run. */
export function LazyOverlays() {
  const cartOpen = useCart((s) => s.drawerOpen);
  const searchOpen = useUi((s) => s.searchOpen);
  const quickViewOpen = useUi((s) => s.quickViewId !== null);
  const [seen, setSeen] = useState({ cart: false, search: false, quick: false });

  if ((cartOpen && !seen.cart) || (searchOpen && !seen.search) || (quickViewOpen && !seen.quick)) {
    setSeen({ cart: seen.cart || cartOpen, search: seen.search || searchOpen, quick: seen.quick || quickViewOpen });
  }

  return (
    <>
      {seen.cart && <CartDrawer />}
      {seen.search && <SearchDialog />}
      {seen.quick && <QuickView />}
    </>
  );
}
