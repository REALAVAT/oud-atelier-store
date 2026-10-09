"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import { revalidateStorefront } from "@/lib/admin-client";
import { localized } from "@/lib/data/seed-products";
import { minPrice, totalStock } from "@/lib/product-utils";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyRow, PageHeader, tdCls, thCls, useAed } from "./admin-ui";
import { cn } from "@/lib/utils";

export function ProductsTable() {
  const t = useTranslations("admin");
  const nav = useTranslations("nav");
  const common = useTranslations("common");
  const locale = useLocale();
  const aed = useAed();
  const { data, loading, refetch } = useRepoQuery(() => repo.listProducts());
  const settings = useRepoQuery(() => repo.getSettings());
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState("all");
  const [status, setStatus] = useState("all");
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (p) =>
        (collection === "all" || p.collection === collection) &&
        (status === "all" || p.status === status) &&
        (!term || `${p.name.en} ${p.name.ar} ${p.slug} ${p.variants.map((v) => v.sku).join(" ")}`.toLowerCase().includes(term)),
    );
  }, [data, q, collection, status]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    await repo.deleteProduct(toDelete.id);
    toast.success(t("productDeleted"));
    setToDelete(null);
    refetch();
    revalidateStorefront();
  };

  const threshold = settings.data?.lowStockThreshold ?? 5;

  return (
    <div>
      <PageHeader
        title={t("products")}
        description={data ? `${data.length}` : undefined}
        actions={
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus aria-hidden /> {t("newProduct")}
            </Link>
          </Button>
        }
      />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchProducts")} aria-label={t("searchProducts")} className="h-10 rounded-none bg-background ps-9" />
        </div>
        <Select value={collection} onValueChange={setCollection} dir={locale === "ar" ? "rtl" : "ltr"}>
          <SelectTrigger className="h-10! w-full rounded-none bg-background sm:w-44" aria-label={t("collection")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">{common("all")}</SelectItem>
            {(["oud", "floral", "fresh", "gift-sets"] as const).map((c) => (
              <SelectItem key={c} value={c}>{nav(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus} dir={locale === "ar" ? "rtl" : "ltr"}>
          <SelectTrigger className="h-10! w-full rounded-none bg-background sm:w-36" aria-label={t("status")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">{common("all")}</SelectItem>
            <SelectItem value="active">{t("active")}</SelectItem>
            <SelectItem value="draft">{t("draft")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative overflow-x-auto border bg-background">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-card">
            <tr>
              <th className={thCls}>{t("product")}</th>
              <th className={thCls}>{t("collection")}</th>
              <th className={thCls}>{t("price")}</th>
              <th className={thCls}>{t("stock")}</th>
              <th className={thCls}>{t("status")}</th>
              <th className={cn(thCls, "text-end")}><span className="sr-only">{common("actions")}</span></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && !data
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="p-3"><Skeleton className="h-12 rounded-none" /></td></tr>
                ))
              : rows.length === 0
                ? <EmptyRow colSpan={6}>{t("noProducts")}</EmptyRow>
                : rows.map((p) => {
                    const stock = totalStock(p);
                    const low = p.variants.some((v) => v.stock <= threshold);
                    return (
                      <tr key={p.id} className="hover:bg-card">
                        <td className={tdCls}>
                          <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                            <div className="relative h-12 w-10 shrink-0 bg-muted">
                              {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium hover:text-gold-deep">{localized(p.name, locale)}</p>
                              <p className="text-xs text-muted-foreground">{t("variantsCount", { count: p.variants.length })}</p>
                            </div>
                          </Link>
                        </td>
                        <td className={cn(tdCls, "whitespace-nowrap")}>{nav(p.collection)}</td>
                        <td className={cn(tdCls, "whitespace-nowrap tabular-nums")}>{aed(minPrice(p))}</td>
                        <td className={cn(tdCls, "whitespace-nowrap tabular-nums", low && "text-red-800")}>
                          {stock} {t("units")}
                        </td>
                        <td className={tdCls}>
                          <span className={cn("inline-flex border px-2 py-0.5 text-[0.7rem] uppercase tracking-[0.12em] rtl:tracking-normal", p.status === "active" ? "border-emerald-800/20 bg-emerald-50 text-emerald-900" : "border-border bg-muted text-muted-foreground")}>
                            {t(p.status)}
                          </span>
                        </td>
                        <td className={cn(tdCls, "text-end")}>
                          <div className="inline-flex gap-1">
                            <Button asChild variant="ghost" size="icon-sm" aria-label={`${common("edit")} ${localized(p.name, locale)}`}>
                              <Link href={`/admin/products/${p.id}`}><Pencil /></Link>
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => setToDelete(p)} aria-label={`${common("delete")} ${localized(p.name, locale)}`}>
                              <Trash2 />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent className="rounded-none">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">{t("deleteProduct")}</DialogTitle>
            <DialogDescription>
              {toDelete && localized(toDelete.name, locale)} — {t("deleteProductBody")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>{common("cancel")}</Button>
            <Button variant="destructive" onClick={confirmDelete}>{common("delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
