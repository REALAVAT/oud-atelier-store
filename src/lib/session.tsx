"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionUser } from "@/lib/types";
import { isDemoMode } from "@/lib/env";
import { useDemoDb } from "@/stores/demo-db";
import { useHydrated } from "@/hooks/use-hydrated";

export const DEMO_ROLE_COOKIE = "oa_demo_role";

const DEMO_CUSTOMER: SessionUser = {
  id: "u_demo_customer",
  email: "aisha.m@example.ae",
  name: "Aisha Al Mansouri",
  role: "customer",
};

const DEMO_ADMIN: SessionUser = {
  id: "u_demo_admin",
  email: "admin@oudatelier.ae",
  name: "Atelier Admin",
  role: "admin",
};

const useDemoSession = create<{ user: SessionUser | null; setUser: (u: SessionUser | null) => void }>()(
  persist((set) => ({ user: null, setUser: (user) => set({ user }) }), {
    name: "oud-atelier-session",
    storage: createJSONStorage(() => localStorage),
  }),
);

function writeRoleCookie(role: SessionUser["role"] | null) {
  if (role) {
    document.cookie = `${DEMO_ROLE_COOKIE}=${role}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
  } else {
    document.cookie = `${DEMO_ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
  }
}

type AuthResult = { ok: true; user: SessionUser } | { ok: false; error: string };

type SessionContextValue = {
  user: SessionUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  demoLogin: (role: "customer" | "admin") => SessionUser;
};

const browserSupabase = () => import("@/lib/supabase/clients").then((m) => m.getBrowserSupabase());

const SessionContext = createContext<SessionContextValue | null>(null);

function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "Guest";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const demoUser = useDemoSession((s) => s.user);
  const setDemoUser = useDemoSession((s) => s.setUser);
  const upsertCustomer = useDemoDb((s) => s.upsertCustomer);
  const [liveUser, setLiveUser] = useState<SessionUser | null>(null);
  const [liveReady, setLiveReady] = useState(isDemoMode);

  useEffect(() => {
    if (isDemoMode) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    const load = async (userId: string | undefined, email?: string, meta?: Record<string, unknown>) => {
      const supabase = await browserSupabase();
      if (!userId) {
        setLiveUser(null);
        setLiveReady(true);
        return;
      }
      const { data } = await supabase.from("profiles").select("full_name, role").eq("id", userId).maybeSingle();
      setLiveUser({
        id: userId,
        email: email ?? "",
        name: (data?.full_name as string) || (meta?.full_name as string) || nameFromEmail(email ?? ""),
        role: data?.role === "admin" ? "admin" : "customer",
      });
      setLiveReady(true);
    };
    browserSupabase().then((supabase) => {
      if (cancelled) return;
      supabase.auth.getUser().then(({ data }) => load(data.user?.id, data.user?.email, data.user?.user_metadata));
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        load(session?.user.id, session?.user.email, session?.user.user_metadata);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const demoLogin = useCallback(
    (role: "customer" | "admin") => {
      const u = role === "admin" ? DEMO_ADMIN : DEMO_CUSTOMER;
      setDemoUser(u);
      writeRoleCookie(u.role);
      return u;
    },
    [setDemoUser],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (isDemoMode) {
        if (password.length < 6) return { ok: false, error: "password" };
        const isAdmin = email.toLowerCase() === DEMO_ADMIN.email;
        const u: SessionUser = isAdmin
          ? DEMO_ADMIN
          : email.toLowerCase() === DEMO_CUSTOMER.email
            ? DEMO_CUSTOMER
            : { id: `u_${btoa(email.toLowerCase()).replace(/=/g, "")}`, email, name: nameFromEmail(email), role: "customer" };
        setDemoUser(u);
        writeRoleCookie(u.role);
        if (!isAdmin) upsertCustomer({ id: u.id, name: u.name, email: u.email, createdAt: new Date().toISOString() });
        return { ok: true, user: u };
      }
      const supabase = await browserSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return { ok: false, error: error?.message ?? "error" };
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", data.user.id)
        .maybeSingle();
      const u: SessionUser = {
        id: data.user.id,
        email: data.user.email ?? email,
        name: (profile?.full_name as string) || nameFromEmail(email),
        role: profile?.role === "admin" ? "admin" : "customer",
      };
      setLiveUser(u);
      return { ok: true, user: u };
    },
    [setDemoUser, upsertCustomer],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      if (isDemoMode) {
        const u: SessionUser = {
          id: `u_${btoa(email.toLowerCase()).replace(/=/g, "")}`,
          email,
          name,
          role: "customer",
        };
        setDemoUser(u);
        writeRoleCookie("customer");
        upsertCustomer({ id: u.id, name, email, createdAt: new Date().toISOString() });
        return { ok: true, user: u };
      }
      const { data, error } = await (await browserSupabase()).auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error || !data.user) return { ok: false, error: error?.message ?? "error" };
      const u: SessionUser = { id: data.user.id, email, name, role: "customer" };
      setLiveUser(u);
      return { ok: true, user: u };
    },
    [setDemoUser, upsertCustomer],
  );

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setDemoUser(null);
      writeRoleCookie(null);
      return;
    }
    await (await browserSupabase()).auth.signOut();
    setLiveUser(null);
  }, [setDemoUser]);

  const value = useMemo<SessionContextValue>(
    () => ({
      user: isDemoMode ? (hydrated ? demoUser : null) : liveUser,
      ready: isDemoMode ? hydrated : liveReady,
      signIn,
      signUp,
      signOut,
      demoLogin,
    }),
    [hydrated, demoUser, liveUser, liveReady, signIn, signUp, signOut, demoLogin],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
