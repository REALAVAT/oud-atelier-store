"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { repo, useRepoQuery } from "@/lib/repo";
import { useDateFormat } from "@/components/account/order-status";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "./admin-ui";
import { cn } from "@/lib/utils";

export function EmailLog() {
  const t = useTranslations("admin");
  const fmt = useDateFormat();
  const { data, loading } = useRepoQuery(() => repo.listEmails());
  const [selected, setSelected] = useState<string | null>(null);
  const current = data?.find((e) => e.id === selected) ?? data?.[0];

  return (
    <div>
      <PageHeader title={t("emailsTitle")} description={t("emailsBody")} />
      {loading && !data ? (
        <Skeleton className="h-96 rounded-none" />
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-3 border border-dashed bg-background px-6 py-20 text-center">
          <Mail className="size-8 text-gold-deep" strokeWidth={1.2} aria-hidden />
          <p className="max-w-sm text-sm text-muted-foreground">{t("noEmails")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ul className="max-h-[70vh] divide-y overflow-y-auto border bg-background">
            {data.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => setSelected(e.id)}
                  aria-current={current?.id === e.id}
                  className={cn("w-full px-4 py-3 text-start transition-colors hover:bg-card", current?.id === e.id && "bg-card")}
                >
                  <p className="truncate text-sm font-medium">{e.subject}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.to}</p>
                  <p className="mt-1 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                    <span>{fmt(e.sentAt, true)}</span>
                    <span className="uppercase tracking-wider">{e.delivered ? t("delivered") : t("logged")}</span>
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {current && (
            <div className="overflow-hidden border bg-background">
              <div className="border-b px-5 py-3 text-sm">
                <p className="font-medium">{current.subject}</p>
                <p className="text-xs text-muted-foreground">{current.to}</p>
              </div>
              <iframe title={current.subject} srcDoc={current.html} sandbox="" className="h-[70vh] w-full bg-[#f7f3ec]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
