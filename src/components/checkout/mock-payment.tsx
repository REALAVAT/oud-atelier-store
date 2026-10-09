"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/stores/cart";
import { clearDraft, completeDemoOrder, readDraft, type CheckoutDraft } from "@/lib/checkout-client";
import { useMoney } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export function MockPayment() {
  const t = useTranslations("checkout");
  const router = useRouter();
  const money = useMoney();
  const clearCart = useCart((s) => s.clear);
  const [draft, setDraft] = useState<CheckoutDraft | null | undefined>(undefined);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const d = readDraft();
    if (!d) router.replace("/checkout");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setDraft(d);
  }, [router]);

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setPaying(true);
    setTimeout(() => {
      const order = completeDemoOrder(draft);
      clearDraft();
      clearCart();
      router.replace(`/checkout/success?order=${order.number}`);
    }, 1400);
  };

  if (!draft) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-16" aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-72 rounded-none" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-12 lg:py-20">
      <div className="border bg-card shadow-[0_30px_80px_-40px_rgba(14,13,11,0.35)]">
        <div className="flex items-center justify-between border-b bg-foreground px-6 py-5 text-background">
          <span className="font-display text-xl tracking-[0.2em]">OUD ATELIER</span>
          <span className="text-xs text-gold-light">{draft.order.number}</span>
        </div>
        <form onSubmit={pay} className="space-y-5 p-6 sm:p-8">
          <div>
            <h1 className="font-display text-3xl">{t("mockTitle")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("mockBody")}</p>
          </div>
          <div className="flex items-baseline justify-between border-y py-4">
            <span className="text-sm text-muted-foreground">{draft.order.email}</span>
            <span className="font-display text-2xl tabular-nums">{money(draft.order.totalAed)}</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-name">{t("cardName")}</Label>
            <Input id="cc-name" autoComplete="cc-name" defaultValue={draft.order.customerName} className="h-12 rounded-none" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cc-number">{t("cardNumber")}</Label>
            <div className="relative">
              <Input
                id="cc-number"
                dir="ltr"
                inputMode="numeric"
                autoComplete="cc-number"
                defaultValue="4242 4242 4242 4242"
                className="h-12 rounded-none pe-12 font-mono tracking-wider"
                required
              />
              <CreditCard className="absolute end-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-xs text-muted-foreground">{t("testCard")}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cc-exp">{t("cardExpiry")}</Label>
              <Input id="cc-exp" dir="ltr" autoComplete="cc-exp" defaultValue="12 / 34" className="h-12 rounded-none font-mono" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc-cvc">{t("cardCvc")}</Label>
              <Input id="cc-cvc" dir="ltr" inputMode="numeric" autoComplete="cc-csc" defaultValue="123" className="h-12 rounded-none font-mono" required />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={paying}>
            {paying ? <Loader2 className="animate-spin" aria-hidden /> : <Lock aria-hidden />}
            {paying ? t("processing") : t("mockPay")}
          </Button>
          <Button asChild variant="link" className="w-full">
            <Link href="/checkout">{t("mockCancel")}</Link>
          </Button>
        </form>
      </div>
    </div>
  );
}
