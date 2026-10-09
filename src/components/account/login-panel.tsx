"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Loader2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "@/lib/session";
import { isDemoMode } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SessionUser } from "@/lib/types";

function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
}

export function LoginPanel() {
  const t = useTranslations("auth");
  const v = useTranslations("validation");
  const router = useRouter();
  const params = useSearchParams();
  const { signIn, signUp, demoLogin } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const next = safeNext(params.get("next"));
  const wantsAdmin = next?.startsWith("/admin");

  const schema = z.object({
    name: mode === "signup" ? z.string().trim().min(2, v("required")) : z.string().optional(),
    email: z.email(v("email")),
    password: z.string().min(6, v("password")),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "" } });
  const errors = form.formState.errors;

  const go = (user: SessionUser) => {
    toast.success(t("welcome", { name: user.name.split(" ")[0] }));
    if (next && (!next.startsWith("/admin") || user.role === "admin")) router.replace(next);
    else router.replace(user.role === "admin" ? "/admin" : "/account");
    router.refresh();
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const res = mode === "signin" ? await signIn(values.email, values.password) : await signUp(values.name ?? "", values.email, values.password);
    if (!res.ok) {
      setError(mode === "signin" ? t("failed") : res.error);
      return;
    }
    go(res.user);
  });

  return (
    <div className="mx-auto w-full max-w-md">
      {wantsAdmin && (
        <p className="mb-6 border border-gold/60 bg-card px-4 py-3 text-sm" role="status">
          {t("adminOnly")}
        </p>
      )}
      <h1 className="font-display text-5xl">{mode === "signin" ? t("signInTitle") : t("signUpTitle")}</h1>
      <p className="mt-3 text-muted-foreground">{mode === "signin" ? t("signInBody") : t("signUpBody")}</p>

      {isDemoMode && (
        <div className="mt-8 border bg-card p-5">
          <p className="eyebrow">{t("demoTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("demoBody")}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" size="sm" className="h-auto min-h-9 whitespace-normal py-2" onClick={() => go(demoLogin("customer"))}>
              <UserRound aria-hidden /> {t("demoCustomer")}
            </Button>
            <Button variant="gold" size="sm" className="h-auto min-h-9 whitespace-normal py-2" onClick={() => go(demoLogin("admin"))}>
              <LayoutDashboard aria-hidden /> {t("demoAdmin")}
            </Button>
          </div>
        </div>
      )}

      {isDemoMode && (
        <div className="my-8 flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground rtl:tracking-normal">
          <span className="h-px flex-1 bg-border" /> {t("or")} <span className="h-px flex-1 bg-border" />
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" autoComplete="name" className="h-12 rounded-none bg-card" aria-invalid={!!errors.name} {...form.register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="login-email">{t("email")}</Label>
          <Input id="login-email" type="email" autoComplete="email" className="h-12 rounded-none bg-card" aria-invalid={!!errors.email} {...form.register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">{t("password")}</Label>
          <Input
            id="login-password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="h-12 rounded-none bg-card"
            aria-invalid={!!errors.password}
            {...form.register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
          {mode === "signin" ? t("submitSignIn") : t("submitSignUp")}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {mode === "signin" ? t("noAccount") : t("haveAccount")}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            form.clearErrors();
          }}
          className="text-foreground underline underline-offset-4"
        >
          {mode === "signin" ? t("createOne") : t("signInLink")}
        </button>
      </p>
    </div>
  );
}
