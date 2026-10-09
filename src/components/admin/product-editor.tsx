"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ImagePlus, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { repo, useRepoQuery } from "@/lib/repo";
import { revalidateStorefront } from "@/lib/admin-client";
import { NOTES } from "@/lib/data/notes";
import { getSiteUrl, supabaseUrl } from "@/lib/env";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel, fieldCls } from "./admin-ui";
import { cn, uid } from "@/lib/utils";

const COLLECTIONS = ["oud", "floral", "fresh", "gift-sets"] as const;
const FAMILIES = ["oud", "amber", "floral", "fresh", "woody", "musk"] as const;
const GENDERS = ["feminine", "masculine", "unisex"] as const;
const OCCASIONS = ["day", "evening", "special", "everyday"] as const;

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || (typeof v === "number" && Number.isNaN(v)) ? undefined : v),
  z.number().positive().optional(),
);
const loc = (min = 1) => z.object({ en: z.string().trim().min(min), ar: z.string().trim().min(min) });

const schema = z.object({
  name: loc(),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  tagline: loc(),
  description: loc(10),
  collection: z.enum(COLLECTIONS),
  family: z.enum(FAMILIES),
  gender: z.enum(GENDERS),
  intensity: z.number().int().min(1).max(5),
  occasions: z.array(z.enum(OCCASIONS)),
  notes: z.object({ top: z.string(), heart: z.string(), base: z.string() }),
  images: z.array(z.string().min(1)).min(1),
  variants: z
    .array(
      z.object({
        id: z.string(),
        sizeMl: z.number().positive(),
        priceAed: z.number().positive(),
        compareAtAed: optionalNumber,
        stock: z.number().int().min(0),
        sku: z.string().trim(),
      }),
    )
    .min(1),
  bestseller: z.boolean(),
  isNew: z.boolean(),
  featured: z.boolean(),
  status: z.enum(["active", "draft"]),
  seo: z.object({ title: loc(0), description: loc(0) }),
});

type FormIn = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

const splitNotes = (s: string) =>
  s
    .split(/[,،]/)
    .map((n) => n.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter(Boolean);

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function toForm(p?: Product): FormIn {
  if (!p) {
    return {
      name: { en: "", ar: "" },
      slug: "",
      tagline: { en: "", ar: "" },
      description: { en: "", ar: "" },
      collection: "oud",
      family: "oud",
      gender: "unisex",
      intensity: 3,
      occasions: ["evening"],
      notes: { top: "", heart: "", base: "" },
      images: [],
      variants: [
        { id: uid("v"), sizeMl: 50, priceAed: 450, compareAtAed: undefined, stock: 20, sku: "" },
        { id: uid("v"), sizeMl: 100, priceAed: 690, compareAtAed: undefined, stock: 12, sku: "" },
      ],
      bestseller: false,
      isNew: true,
      featured: false,
      status: "draft",
      seo: { title: { en: "", ar: "" }, description: { en: "", ar: "" } },
    };
  }
  return {
    ...p,
    notes: { top: p.notes.top.join(", "), heart: p.notes.heart.join(", "), base: p.notes.base.join(", ") },
    variants: p.variants.map((v) => ({ id: v.id, sizeMl: v.sizeMl, priceAed: v.priceAed, compareAtAed: v.compareAtAed, stock: v.stock, sku: v.sku })),
    bestseller: !!p.bestseller,
    isNew: !!p.isNew,
    featured: !!p.featured,
  };
}

function allowedImage(url: string) {
  try {
    const u = new URL(url);
    const hosts = ["images.unsplash.com"];
    if (supabaseUrl) hosts.push(new URL(supabaseUrl).hostname);
    return u.protocol === "https:" && hosts.includes(u.hostname);
  } catch {
    return false;
  }
}

function Err({ show, children }: { show: boolean; children: React.ReactNode }) {
  return show ? <p className="text-xs text-destructive">{children}</p> : null;
}

export function ProductEditor({ id }: { id?: string }) {
  const { data: products, loading } = useRepoQuery(() => repo.listProducts());
  const product = useMemo(() => products?.find((p) => p.id === id), [products, id]);
  if (id && loading && !products) {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[60vh] rounded-none" />
      </div>
    );
  }
  if (id && !product) {
    return <NotFoundProduct />;
  }
  return <EditorForm key={product?.id ?? "new"} product={product} allProducts={products ?? []} />;
}

function NotFoundProduct() {
  const t = useTranslations("admin");
  return (
    <div className="border border-dashed p-12 text-center">
      <p className="font-display text-2xl">{t("noProducts")}</p>
      <Link href="/admin/products" className="link-underline mt-4 inline-block text-sm">{t("products")}</Link>
    </div>
  );
}

function EditorForm({ product, allProducts }: { product?: Product; allProducts: Product[] }) {
  const t = useTranslations("admin");
  const nav = useTranslations("nav");
  const pt = useTranslations("product");
  const fam = useTranslations("families");
  const gen = useTranslations("genders");
  const occ = useTranslations("occasions");
  const v = useTranslations("validation");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!product);
  const dir = locale === "ar" ? "rtl" : "ltr";

  const form = useForm<FormIn, unknown, FormOut>({ resolver: zodResolver(schema), defaultValues: toForm(product) });
  const { register, control, setValue, getValues, formState } = form;
  const errors = formState.errors;
  const variants = useFieldArray({ control, name: "variants" });
  const images = useWatch({ control, name: "images" });
  const nameEn = useWatch({ control, name: "name.en" });
  const slug = useWatch({ control, name: "slug" });
  const seo = useWatch({ control, name: "seo" });
  const tagline = useWatch({ control, name: "tagline" });

  useEffect(() => {
    if (!slugTouched) setValue("slug", slugify(nameEn ?? ""));
  }, [nameEn, slugTouched, setValue]);

  const slugTaken = allProducts.some((p) => p.slug === slug && p.id !== product?.id);

  const addImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files).slice(0, 6)) {
        if (!f.type.startsWith("image/") || f.size > 8 * 1024 * 1024) continue;
        urls.push(await repo.uploadImage(f));
      }
      setValue("images", [...getValues("images"), ...urls], { shouldValidate: true, shouldDirty: true });
    } catch {
      toast.error(common("error"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const addUrl = () => {
    if (!allowedImage(imageUrl)) {
      toast.error("images.unsplash.com");
      return;
    }
    setValue("images", [...getValues("images"), imageUrl], { shouldValidate: true, shouldDirty: true });
    setImageUrl("");
  };

  const moveFirst = (idx: number) => {
    const list = [...getValues("images")];
    const [img] = list.splice(idx, 1);
    setValue("images", [img, ...list], { shouldDirty: true });
  };

  const removeImage = (idx: number) =>
    setValue("images", getValues("images").filter((_, i) => i !== idx), { shouldValidate: true, shouldDirty: true });

  const onSubmit = form.handleSubmit(
    async (values) => {
      if (slugTaken) return;
      const code = values.slug.split("-").map((w) => w[0]).join("").toUpperCase().slice(0, 3) || "OA";
      const next: Product = {
        id: product?.id ?? uid("p"),
        slug: values.slug,
        name: values.name,
        tagline: values.tagline,
        description: values.description,
        collection: values.collection,
        family: values.family,
        gender: values.gender,
        intensity: values.intensity as Product["intensity"],
        occasions: values.occasions,
        notes: { top: splitNotes(values.notes.top), heart: splitNotes(values.notes.heart), base: splitNotes(values.notes.base) },
        images: values.images,
        variants: values.variants
          .map((x) => ({ ...x, sku: x.sku || `OA-${code}-${x.sizeMl}` }))
          .sort((a, b) => a.sizeMl - b.sizeMl),
        bestseller: values.bestseller,
        isNew: values.isNew,
        featured: values.featured,
        status: values.status,
        seo: {
          title: { en: values.seo.title.en || `${values.name.en} — ${values.tagline.en}`, ar: values.seo.title.ar || `${values.name.ar} — ${values.tagline.ar}` },
          description: { en: values.seo.description.en || values.description.en.slice(0, 155), ar: values.seo.description.ar || values.description.ar.slice(0, 155) },
        },
        rating: product?.rating ?? 5,
        reviewCount: product?.reviewCount ?? 0,
        createdAt: product?.createdAt ?? new Date().toISOString(),
      };
      try {
        await repo.saveProduct(next);
        toast.success(t("productSaved"));
        revalidateStorefront();
        router.push("/admin/products");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : common("error"));
      }
    },
    () => toast.error(v("required")),
  );

  const langTabs = (render: (l: "en" | "ar") => React.ReactNode) => (
    <Tabs defaultValue="en" dir={dir}>
      <TabsList className="rounded-none">
        <TabsTrigger value="en" className="rounded-none">{t("english")}</TabsTrigger>
        <TabsTrigger value="ar" className="rounded-none">{t("arabic")}</TabsTrigger>
      </TabsList>
      <TabsContent value="en" className="mt-4 space-y-4">{render("en")}</TabsContent>
      <TabsContent value="ar" className="mt-4 space-y-4" dir="rtl" lang="ar">{render("ar")}</TabsContent>
    </Tabs>
  );

  const site = getSiteUrl().replace(/^https?:\/\//, "");

  return (
    <form onSubmit={onSubmit} noValidate>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden /> {t("products")}
      </Link>
      <PageHeader
        title={product ? t("editProduct") : t("newProduct")}
        description={product ? product.name[locale === "ar" ? "ar" : "en"] : undefined}
        actions={
          <>
            {product && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/products/${product.slug}`} target="_blank">{t("openStore")}</Link>
              </Button>
            )}
            <Button type="submit" size="sm" disabled={formState.isSubmitting}>
              {formState.isSubmitting && <Loader2 className="animate-spin" aria-hidden />}
              {formState.isSubmitting ? common("saving") : common("save")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title={t("content")}>
            <div className="p-5">
              {langTabs((l) => (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`name-${l}`}>{t("name")}</Label>
                    <Input id={`name-${l}`} className={fieldCls} aria-invalid={!!errors.name?.[l]} {...register(`name.${l}`)} />
                    <Err show={!!errors.name?.[l]}>{v("required")}</Err>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tagline-${l}`}>{t("tagline")}</Label>
                    <Input id={`tagline-${l}`} className={fieldCls} aria-invalid={!!errors.tagline?.[l]} {...register(`tagline.${l}`)} />
                    <Err show={!!errors.tagline?.[l]}>{v("required")}</Err>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`desc-${l}`}>{t("description")}</Label>
                    <Textarea id={`desc-${l}`} className="min-h-36 rounded-none bg-background" aria-invalid={!!errors.description?.[l]} {...register(`description.${l}`)} />
                    <Err show={!!errors.description?.[l]}>{v("min", { min: 10 })}</Err>
                  </div>
                </>
              ))}
              {(errors.name || errors.tagline || errors.description) && (
                <p className="mt-3 text-xs text-destructive">{t("english")} + {t("arabic")}: {v("required")}</p>
              )}
            </div>
          </Panel>

          <Panel title={t("media")}>
            <div className="space-y-4 p-5">
              <p className="text-xs text-muted-foreground">{t("imagesHint")}</p>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {images.map((src, idx) => (
                  <li key={`${src.slice(-24)}-${idx}`} className="group relative aspect-[4/5] overflow-hidden border bg-muted">
                    <Image src={src} alt="" fill sizes="160px" className="object-cover" unoptimized={src.startsWith("data:")} />
                    {idx === 0 && <span className="absolute start-1 top-1 bg-ink px-1.5 py-0.5 text-[0.6rem] uppercase text-background">1</span>}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 p-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                      <button type="button" onClick={() => moveFirst(idx)} className="p-1 text-background" aria-label={t("makePrimary")} disabled={idx === 0}>
                        <Star className="size-3.5" />
                      </button>
                      <button type="button" onClick={() => removeImage(idx)} className="p-1 text-background" aria-label={t("removeImage")}>
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 border border-dashed text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                  >
                    {uploading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
                    {uploading ? t("uploading") : t("uploadImage")}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => addImages(e.target.files)} />
                </li>
              </ul>
              <Err show={!!errors.images}>{v("required")}</Err>
              <div className="flex gap-2">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder={t("imageUrl")}
                  aria-label={t("imageUrl")}
                  className={cn(fieldCls, "h-10")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={addUrl} disabled={!imageUrl}>{t("addUrl")}</Button>
              </div>
            </div>
          </Panel>

          <Panel title={t("variants")}>
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="border-b bg-card text-[0.7rem] uppercase tracking-[0.12em] text-muted-foreground rtl:tracking-normal">
                  <tr>
                    <th className="px-4 py-2 text-start font-medium">{t("sizeMl")}</th>
                    <th className="px-4 py-2 text-start font-medium">{t("priceAed")}</th>
                    <th className="px-4 py-2 text-start font-medium">{t("compareAt")}</th>
                    <th className="px-4 py-2 text-start font-medium">{t("stock")}</th>
                    <th className="px-4 py-2 text-start font-medium">{t("sku")}</th>
                    <th className="px-2 py-2"><span className="sr-only">{common("actions")}</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {variants.fields.map((f, i) => (
                    <tr key={f.id}>
                      <td className="px-4 py-2"><Input type="number" min={1} aria-label={t("sizeMl")} className="h-9 w-20 rounded-none" aria-invalid={!!errors.variants?.[i]?.sizeMl} {...register(`variants.${i}.sizeMl`, { valueAsNumber: true })} /></td>
                      <td className="px-4 py-2"><Input type="number" min={1} aria-label={t("priceAed")} className="h-9 w-24 rounded-none" aria-invalid={!!errors.variants?.[i]?.priceAed} {...register(`variants.${i}.priceAed`, { valueAsNumber: true })} /></td>
                      <td className="px-4 py-2"><Input type="number" min={0} aria-label={t("compareAt")} className="h-9 w-24 rounded-none" {...register(`variants.${i}.compareAtAed`, { valueAsNumber: true })} /></td>
                      <td className="px-4 py-2"><Input type="number" min={0} aria-label={t("stock")} className="h-9 w-20 rounded-none" aria-invalid={!!errors.variants?.[i]?.stock} {...register(`variants.${i}.stock`, { valueAsNumber: true })} /></td>
                      <td className="px-4 py-2"><Input aria-label={t("sku")} placeholder="OA-XXX-50" className="h-9 w-32 rounded-none font-mono text-xs" {...register(`variants.${i}.sku`)} /></td>
                      <td className="px-2 py-2 text-end">
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => variants.remove(i)} disabled={variants.fields.length === 1} aria-label={t("removeVariant")}>
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t p-4">
              <Button type="button" variant="outline" size="xs" onClick={() => variants.append({ id: uid("v"), sizeMl: 30, priceAed: 250, compareAtAed: undefined, stock: 10, sku: "" })}>
                <Plus aria-hidden /> {t("addVariant")}
              </Button>
              {errors.variants && <p className="mt-2 text-xs text-destructive">{v("number")}</p>}
            </div>
          </Panel>

          <Panel title={t("seo")}>
            <div className="space-y-5 p-5">
              {langTabs((l) => (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`seo-title-${l}`}>{t("seoTitle")}</Label>
                    <Input id={`seo-title-${l}`} maxLength={70} className={fieldCls} {...register(`seo.title.${l}`)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`seo-desc-${l}`}>{t("seoDescription")}</Label>
                    <Textarea id={`seo-desc-${l}`} maxLength={170} className="min-h-20 rounded-none bg-background" {...register(`seo.description.${l}`)} />
                  </div>
                </>
              ))}
              <div className="border bg-card p-4">
                <p className="mb-2 text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground rtl:tracking-normal">{t("seoPreview")}</p>
                <p className="truncate text-xs text-emerald-800" dir="ltr">{site} › products › {slug || "…"}</p>
                <p className="mt-1 truncate text-lg text-[#1a0dab]">{seo?.title?.en || `${nameEn || "…"} — ${tagline?.en ?? ""}`}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">{seo?.description?.en || "…"}</p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title={t("general")}>
            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} dir={dir}>
                      <SelectTrigger id="status" className="h-11! w-full rounded-none bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="active">{t("active")}</SelectItem>
                        <SelectItem value="draft">{t("draft")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t("slug")}</Label>
                <Input
                  id="slug"
                  dir="ltr"
                  className={cn(fieldCls, "font-mono text-xs")}
                  aria-invalid={!!errors.slug || slugTaken}
                  {...register("slug", { onChange: () => setSlugTouched(true) })}
                />
                <Err show={!!errors.slug || slugTaken}>{slugTaken ? `/${slug} ✕` : "a-z, 0-9, -"}</Err>
              </div>
              {(
                [
                  ["collection", COLLECTIONS, (x: string) => nav(x as "oud")],
                  ["family", FAMILIES, (x: string) => fam(x as "oud")],
                  ["gender", GENDERS, (x: string) => gen(x as "unisex")],
                ] as const
              ).map(([name, options, label]) => (
                <div key={name} className="space-y-2">
                  <Label htmlFor={name}>{t(name)}</Label>
                  <Controller
                    control={control}
                    name={name}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} dir={dir}>
                        <SelectTrigger id={name} className="h-11! w-full rounded-none bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-none">
                          {options.map((o) => <SelectItem key={o} value={o}>{label(o)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="intensity">{t("intensity")}</Label>
                <Input id="intensity" type="number" min={1} max={5} className={fieldCls} {...register("intensity", { valueAsNumber: true })} />
              </div>
              <fieldset className="space-y-2">
                <legend className="mb-2 text-sm font-medium">{pt("occasion")}</legend>
                <Controller
                  control={control}
                  name="occasions"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((o) => {
                        const on = field.value.includes(o);
                        return (
                          <button
                            key={o}
                            type="button"
                            aria-pressed={on}
                            onClick={() => field.onChange(on ? field.value.filter((x) => x !== o) : [...field.value, o])}
                            className={cn("border px-3 py-1.5 text-xs transition-colors", on ? "border-foreground bg-foreground text-background" : "hover:border-foreground")}
                          >
                            {occ(o)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </fieldset>
            </div>
          </Panel>

          <Panel title={t("flags")}>
            <div className="space-y-4 p-5">
              {(["bestseller", "isNew", "featured"] as const).map((f) => (
                <Controller
                  key={f}
                  control={control}
                  name={f}
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-center justify-between gap-4 text-sm">
                      {t(f)}
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </label>
                  )}
                />
              ))}
            </div>
          </Panel>

          <Panel title={pt("notes")}>
            <div className="space-y-4 p-5">
              <datalist id="note-keys">
                {Object.keys(NOTES).map((k) => <option key={k} value={k} />)}
              </datalist>
              {(["top", "heart", "base"] as const).map((tier) => (
                <div key={tier} className="space-y-2">
                  <Label htmlFor={`notes-${tier}`}>{t(tier === "top" ? "notesTop" : tier === "heart" ? "notesHeart" : "notesBase")}</Label>
                  <Input id={`notes-${tier}`} dir="ltr" list="note-keys" className={cn(fieldCls, "text-sm")} {...register(`notes.${tier}`)} />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">{t("notesHint")}</p>
            </div>
          </Panel>
        </div>
      </div>
    </form>
  );
}
