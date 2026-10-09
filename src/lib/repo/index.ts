"use client";

import { useCallback, useEffect, useState } from "react";
import { isDemoMode } from "@/lib/env";
import { useDemoDb } from "@/stores/demo-db";
import { demoRepo } from "./demo-repo";
import type { Repo } from "./types";

/** Keeps the Supabase client out of the shared bundle; it loads on the first live-mode call. */
const lazySupabaseRepo = new Proxy({} as Repo, {
  get: (_target, method: keyof Repo) =>
    (...args: unknown[]) =>
      import("./supabase-repo").then(({ supabaseRepo }) =>
        (supabaseRepo[method] as (...a: unknown[]) => Promise<unknown>)(...args),
      ),
});

export const repo: Repo = isDemoMode ? demoRepo : lazySupabaseRepo;

type QueryState<T> = { data: T | undefined; loading: boolean; error: string | null };

/**
 * Minimal async data hook. Re-runs whenever the demo database changes, or when
 * `refetch` is called after a mutation in live mode.
 */
export function useRepoQuery<T>(fn: () => Promise<T>, deps: unknown[] = [], enabled = true) {
  const revision = useDemoDb((s) => s.revision);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<QueryState<T>>({ data: undefined, loading: enabled, error: null });

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    fn()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((e: unknown) =>
        alive && setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : String(e) })),
      );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision, tick, enabled, ...deps]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, refetch };
}
