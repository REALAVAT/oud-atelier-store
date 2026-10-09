"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR and the hydration pass, true afterwards. Guards localStorage-backed UI. */
export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
