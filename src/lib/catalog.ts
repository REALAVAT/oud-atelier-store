import "server-only";
import { cache } from "react";
import { isDemoMode } from "@/lib/env";
import type { CollectionSlug, Product, Review, StoreSettings } from "@/lib/types";
import { COLLECTIONS, SEED_PRODUCTS } from "@/lib/data/seed-products";
import { SEED_REVIEWS, SEED_SETTINGS } from "@/lib/data/seed-extra";
import { getPublicSupabase } from "@/lib/supabase/clients";
import { rowToProduct, rowToReview, rowToSettings } from "@/lib/supabase/mappers";

export const getProducts = cache(async (): Promise<Product[]> => {
  if (isDemoMode) return SEED_PRODUCTS.filter((p) => p.status === "active");
  const { data, error } = await getPublicSupabase()
    .from("products")
    .select("*, product_variants(*)")
    .eq("status", "active")
    .order("created_at", { ascending: true });
  if (error || !data) return SEED_PRODUCTS;
  return data.map(rowToProduct);
});

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
});

export async function getProductsByCollection(slug: CollectionSlug) {
  return (await getProducts()).filter((p) => p.collection === slug);
}

export function getCollections() {
  return COLLECTIONS;
}

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

export const getReviews = cache(async (productId: string): Promise<Review[]> => {
  if (isDemoMode) return SEED_REVIEWS.filter((r) => r.productId === productId);
  const { data } = await getPublicSupabase()
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []).map(rowToReview);
});

export async function getFeaturedReviews(limit = 6) {
  if (isDemoMode) {
    return SEED_REVIEWS.filter((r) => r.rating === 5)
      .filter((_, i) => i % 9 === 0)
      .slice(0, limit);
  }
  const { data } = await getPublicSupabase()
    .from("reviews")
    .select("*")
    .eq("rating", 5)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(rowToReview);
}

export async function getRelated(product: Product, limit = 4) {
  const all = await getProducts();
  return all
    .filter((p) => p.id !== product.id)
    .map((p) => ({
      p,
      score:
        (p.family === product.family ? 3 : 0) +
        (p.collection === product.collection ? 2 : 0) +
        (p.gender === product.gender ? 1 : 0) +
        p.rating / 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export const getSettings = cache(async (): Promise<StoreSettings> => {
  if (isDemoMode) return SEED_SETTINGS;
  const { data } = await getPublicSupabase().from("store_settings").select("data").eq("id", 1).maybeSingle();
  return rowToSettings(data, SEED_SETTINGS);
});
