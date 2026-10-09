"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Star, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import type { Review } from "@/lib/types";
import { repo, useRepoQuery } from "@/lib/repo";
import { useSession } from "@/lib/session";
import { isDemoMode } from "@/lib/env";
import { Link, usePathname } from "@/i18n/navigation";
import { RatingStars } from "./rating-stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, nowIso, uid } from "@/lib/utils";

export function ProductReviews({
  productId,
  initial,
  rating,
  reviewCount,
}: {
  productId: string;
  initial: Review[];
  rating: number;
  reviewCount: number;
}) {
  const t = useTranslations("product");
  const v = useTranslations("validation");
  const common = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const { data: local } = useRepoQuery(() => repo.listReviews(productId), [productId]);
  const reviews = useMemo(() => [...(local ?? []), ...initial], [local, initial]);

  const schema = z.object({
    author: z.string().min(2, v("min", { min: 2 })),
    rating: z.number().min(1, v("required")).max(5),
    title: z.string().min(2, v("min", { min: 2 })),
    body: z.string().min(10, v("min", { min: 10 })),
  });
  type FormValues = z.infer<typeof schema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { author: user?.name ?? "", rating: 0, title: "", body: "" },
  });
  const ratingValue = useWatch({ control: form.control, name: "rating" });

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const share = star === 5 ? 0.78 : star === 4 ? 0.16 : star === 3 ? 0.04 : star === 2 ? 0.015 : 0.005;
    return { star, share: Math.round(share * 100) };
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await repo.addReview({
        id: uid("r_local"),
        productId,
        createdAt: nowIso(),
        verified: !!user,
        ...values,
      });
    } catch {
      toast.error(common("error"));
      return;
    }
    toast.success(t("reviewThanks"));
    form.reset({ author: values.author, rating: 0, title: "", body: "" });
    setOpen(false);
  });

  const date = (iso: string) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

  return (
    <section id="reviews" className="scroll-mt-28 py-20 lg:py-28" aria-labelledby="reviews-heading">
      <div className="container-luxe grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-20">
        <div>
          <h2 id="reviews-heading" className="font-display text-4xl">{t("reviews")}</h2>
          <div className="mt-6 flex items-end gap-4">
            <span className="font-display text-6xl leading-none">{rating.toFixed(1)}</span>
            <div className="pb-1">
              <RatingStars rating={rating} size={16} label={t("ratingLabel", { rating })} />
              <p className="mt-1 text-xs text-muted-foreground">{t("reviewsCount", { count: reviewCount })}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-2" aria-hidden>
            {distribution.map((d) => (
              <li key={d.star} className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="w-3 tabular-nums">{d.star}</span>
                <span className="h-1 flex-1 bg-border">
                  <span className="block h-1 bg-gold" style={{ width: `${d.share}%` }} />
                </span>
                <span className="w-8 text-end tabular-nums">{d.share}%</span>
              </li>
            ))}
          </ul>
          {!isDemoMode && !user ? (
            <Button asChild variant="outline" className="mt-8 w-full">
              <Link href={`/login?next=${encodeURIComponent(pathname)}`}>{t("writeReview")}</Link>
            </Button>
          ) : (
            <Button variant="outline" className="mt-8 w-full" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
              {t("writeReview")}
            </Button>
          )}
        </div>

        <div>
          {open && (
            <form onSubmit={onSubmit} className="mb-12 space-y-5 border bg-card p-6 sm:p-8" noValidate>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">{t("ratingLabel", { rating: ratingValue || 0 })}</legend>
                <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onMouseEnter={() => setHover(n)}
                      onClick={() => form.setValue("rating", n, { shouldValidate: true })}
                      aria-label={`${n} / 5`}
                      aria-pressed={ratingValue === n}
                    >
                      <Star
                        className={cn("size-7", n <= (hover || ratingValue) ? "fill-gold text-gold" : "text-gold/40")}
                        strokeWidth={1.2}
                      />
                    </button>
                  ))}
                </div>
                {form.formState.errors.rating && <p className="mt-1 text-xs text-destructive">{form.formState.errors.rating.message}</p>}
              </fieldset>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rv-author">{t("reviewName")}</Label>
                  <Input id="rv-author" className="h-11 rounded-none" {...form.register("author")} aria-invalid={!!form.formState.errors.author} />
                  {form.formState.errors.author && <p className="text-xs text-destructive">{form.formState.errors.author.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rv-title">{t("reviewTitle")}</Label>
                  <Input id="rv-title" className="h-11 rounded-none" {...form.register("title")} aria-invalid={!!form.formState.errors.title} />
                  {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rv-body">{t("reviewBody")}</Label>
                <Textarea id="rv-body" className="min-h-28 rounded-none" {...form.register("body")} aria-invalid={!!form.formState.errors.body} />
                {form.formState.errors.body && <p className="text-xs text-destructive">{form.formState.errors.body.message}</p>}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>{t("reviewSubmit")}</Button>
            </form>
          )}

          <ul className="divide-y border-y">
            {reviews.map((r) => (
              <li key={r.id} className="grid gap-3 py-8 sm:grid-cols-[180px_1fr] sm:gap-8">
                <div className="text-sm">
                  <p className="font-medium">{r.author}</p>
                  {r.location && <p className="text-xs text-muted-foreground">{r.location}</p>}
                  {r.verified && (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-gold-deep">
                      <BadgeCheck className="size-3.5" aria-hidden /> {t("verified")}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <RatingStars rating={r.rating} size={13} label={t("ratingLabel", { rating: r.rating })} />
                    <time dateTime={r.createdAt} className="text-xs text-muted-foreground">{date(r.createdAt)}</time>
                  </div>
                  <h3 className="mt-3 font-display text-xl">{locale === "ar" && r.titleAr ? r.titleAr : r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{locale === "ar" && r.bodyAr ? r.bodyAr : r.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
