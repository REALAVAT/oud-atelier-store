"use client";

import type { Repo } from "./types";
import { getBrowserSupabase } from "@/lib/supabase/clients";
import {
  addressToRow,
  discountToRow,
  productToRow,
  rowToAddress,
  rowToCustomer,
  rowToDiscount,
  rowToOrder,
  rowToProduct,
  rowToSettings,
  variantToRow,
} from "@/lib/supabase/mappers";
import { SEED_SETTINGS } from "@/lib/data/seed-extra";

const sb = () => getBrowserSupabase();
const ORDER_SELECT = "*, order_status_events(*)";

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

const isUuid = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

export const supabaseRepo: Repo = {
  async listProducts() {
    const data = must(await sb().from("products").select("*, product_variants(*)").order("created_at"));
    return data.map(rowToProduct);
  },
  async saveProduct(p) {
    const row = productToRow(p);
    const saved = isUuid(p.id)
      ? must(await sb().from("products").update(row).eq("id", p.id).select().single())
      : must(await sb().from("products").insert(row).select().single());
    const productId = (saved as unknown as { id: string }).id;
    const keep = p.variants.filter((v) => isUuid(v.id)).map((v) => v.id);
    const del = sb().from("product_variants").delete().eq("product_id", productId);
    must(await (keep.length ? del.not("id", "in", `(${keep.join(",")})`) : del));
    for (const v of p.variants) {
      const vr = variantToRow(v, productId);
      if (isUuid(v.id)) must(await sb().from("product_variants").update(vr).eq("id", v.id));
      else must(await sb().from("product_variants").insert(vr));
    }
    return { ...p, id: productId };
  },
  async deleteProduct(id) {
    must(await sb().from("products").delete().eq("id", id));
  },
  async uploadImage(file) {
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `products/${crypto.randomUUID()}.${ext}`;
    must(await sb().storage.from("product-images").upload(path, file, { upsert: false, contentType: file.type }));
    return sb().storage.from("product-images").getPublicUrl(path).data.publicUrl;
  },

  async listOrders() {
    const data = must(await sb().from("orders").select(ORDER_SELECT).order("created_at", { ascending: false }));
    return data.map(rowToOrder);
  },
  async getOrder(id) {
    const q = sb().from("orders").select(ORDER_SELECT);
    const { data } = await (isUuid(id) ? q.eq("id", id) : q.eq("number", id)).maybeSingle();
    return data ? rowToOrder(data) : null;
  },
  async listMyOrders(userId) {
    const data = must(
      await sb().from("orders").select(ORDER_SELECT).eq("user_id", userId).order("created_at", { ascending: false }),
    );
    return data.map(rowToOrder);
  },
  async updateOrderStatus(id, status, note) {
    must(await sb().from("orders").update({ status }).eq("id", id));
    must(await sb().from("order_status_events").insert({ order_id: id, status, note: note ?? null }));
    return this.getOrder(id);
  },

  async listCustomers() {
    const data = must(await sb().from("customer_summaries").select("*").order("created_at", { ascending: false }));
    return data.map(rowToCustomer);
  },

  async listDiscounts() {
    const data = must(await sb().from("discount_codes").select("*").order("created_at", { ascending: false }));
    return data.map(rowToDiscount);
  },
  async saveDiscount(d) {
    const row = discountToRow(d);
    if (isUuid(d.id)) must(await sb().from("discount_codes").update(row).eq("id", d.id));
    else must(await sb().from("discount_codes").insert(row));
  },
  async deleteDiscount(id) {
    must(await sb().from("discount_codes").delete().eq("id", id));
  },

  async getSettings() {
    const { data } = await sb().from("store_settings").select("data").eq("id", 1).maybeSingle();
    return rowToSettings(data, SEED_SETTINGS);
  },
  async saveSettings(s) {
    must(await sb().from("store_settings").upsert({ id: 1, data: s }));
  },

  async listAddresses(userId) {
    const data = must(await sb().from("addresses").select("*").eq("user_id", userId).order("created_at"));
    return data.map(rowToAddress);
  },
  async saveAddress(userId, a) {
    if (a.isDefault) must(await sb().from("addresses").update({ is_default: false }).eq("user_id", userId));
    const row = addressToRow(a, userId);
    if (a.id && isUuid(a.id)) must(await sb().from("addresses").update(row).eq("id", a.id));
    else must(await sb().from("addresses").insert(row));
  },
  async deleteAddress(_userId, id) {
    must(await sb().from("addresses").delete().eq("id", id));
  },

  async listReviews() {
    return [];
  },
  async addReview(r) {
    const { data } = await sb().auth.getUser();
    must(
      await sb().from("reviews").insert({
        product_id: r.productId,
        user_id: data.user?.id ?? null,
        author: r.author,
        rating: r.rating,
        title: r.title,
        body: r.body,
      }),
    );
  },
  async listEmails() {
    return [];
  },
};