/**
 * Seeds a Supabase project with the Oud Atelier catalog, reviews, discount codes and settings.
 *
 *   npm run db:seed
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Optionally creates an admin user when SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are set.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { SEED_PRODUCTS } from "../src/lib/data/seed-products";
import { SEED_DISCOUNTS, SEED_REVIEWS, SEED_SETTINGS } from "../src/lib/data/seed-extra";
import { discountToRow, productToRow } from "../src/lib/supabase/mappers";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function must<T>(label: string, p: PromiseLike<{ data: T; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
}

async function main() {
  await must("settings", sb.from("store_settings").upsert({ id: 1, data: SEED_SETTINGS }));
  console.log("✓ settings");

  for (const d of SEED_DISCOUNTS) {
    await must(`discount ${d.code}`, sb.from("discount_codes").upsert(discountToRow(d), { onConflict: "code" }));
  }
  console.log(`✓ ${SEED_DISCOUNTS.length} discount codes`);

  for (const p of SEED_PRODUCTS) {
    const saved = await must(
      `product ${p.slug}`,
      sb
        .from("products")
        .upsert({ ...productToRow(p), created_at: p.createdAt }, { onConflict: "slug" })
        .select("id")
        .single(),
    );
    const productId = (saved as { id: string }).id;

    await must(`variants ${p.slug}`, sb.from("product_variants").delete().eq("product_id", productId));
    await must(
      `variants ${p.slug}`,
      sb.from("product_variants").insert(
        p.variants.map((v) => ({
          product_id: productId,
          size_ml: v.sizeMl,
          price_aed: v.priceAed,
          compare_at_aed: v.compareAtAed ?? null,
          stock: v.stock,
          sku: v.sku,
          label: v.label ?? null,
        })),
      ),
    );

    const reviews = SEED_REVIEWS.filter((r) => r.productId === p.id);
    await must(`reviews ${p.slug}`, sb.from("reviews").delete().eq("product_id", productId).is("user_id", null));
    if (reviews.length) {
      await must(
        `reviews ${p.slug}`,
        sb.from("reviews").insert(
          reviews.map((r) => ({
            product_id: productId,
            author: r.author,
            location: r.location ?? null,
            rating: r.rating,
            title: r.title,
            body: r.body,
            verified: !!r.verified,
            created_at: r.createdAt,
          })),
        ),
      );
    }
  }
  console.log(`✓ ${SEED_PRODUCTS.length} products with variants and reviews`);

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    const { data, error } = await sb.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Atelier Admin" },
    });
    let userId = data.user?.id;
    if (error) {
      const { data: list } = await sb.auth.admin.listUsers({ perPage: 1000 });
      userId = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
    }
    if (userId) {
      await must(
        "admin profile",
        sb.from("profiles").upsert({ id: userId, email, full_name: "Atelier Admin", role: "admin" }),
      );
      console.log(`✓ admin user ${email}`);
    }
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
