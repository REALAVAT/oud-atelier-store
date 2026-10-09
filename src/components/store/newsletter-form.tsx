"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function NewsletterForm({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const dark = tone === "dark";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("newsletterInvalid"));
      return;
    }
    setError(null);
    setState("loading");
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
    } catch {
      // Subscribing is best-effort; the code is still shown.
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className={cn("flex flex-wrap items-center gap-3 text-sm", className)} role="status">
        <Check className={cn("size-4", dark ? "text-gold-light" : "text-gold-deep")} aria-hidden />
        <span>{t("newsletterSuccess")}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText("WELCOME10");
            toast.success("WELCOME10");
          }}
          className={cn(
            "inline-flex items-center gap-2 border px-3 py-1.5 font-mono tracking-widest",
            dark ? "border-gold-light text-gold-light" : "border-foreground",
          )}
        >
          WELCOME10 <Copy className="size-3.5" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={cn("w-full", className)} noValidate>
      <label htmlFor={id} className="sr-only">
        {t("newsletterPlaceholder")}
      </label>
      <div className={cn("flex items-center border-b", dark ? "border-background/40" : "border-foreground/50")}>
        <input
          id={id}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletterPlaceholder")}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={cn(
            "h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60",
            dark ? "text-background placeholder:text-background" : "placeholder:text-foreground",
          )}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className={cn(
            "inline-flex h-12 items-center gap-2 ps-4 text-xs font-medium uppercase tracking-[0.2em] rtl:tracking-normal",
            dark ? "text-gold-light hover:text-background" : "hover:text-gold-deep",
          )}
        >
          {t("newsletterCta")}
          <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
        </button>
      </div>
      {error && (
        <p id={`${id}-err`} className={cn("mt-2 text-xs", dark ? "text-gold-light" : "text-destructive")}>
          {error}
        </p>
      )}
    </form>
  );
}
