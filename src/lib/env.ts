export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True when no Supabase project is configured: the store runs on seeded data + localStorage. */
export const isDemoMode = !(supabaseUrl && supabaseAnonKey);

export const isStripeEnabled = () => Boolean(process.env.STRIPE_SECRET_KEY);
export const isResendEnabled = () => Boolean(process.env.RESEND_API_KEY);

export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971500000000";

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProd) return `https://${vercelProd}`;
  return "https://store.ahmadkhajeh.com";
}
