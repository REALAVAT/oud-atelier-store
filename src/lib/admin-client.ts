"use client";

import { isDemoMode } from "@/lib/env";

/** Lets statically rendered storefront pages pick up catalog/settings edits in live mode. */
export async function revalidateStorefront() {
  if (isDemoMode) return;
  try {
    await fetch("/api/revalidate", { method: "POST" });
  } catch {
    // Pages also revalidate on their own schedule.
  }
}
