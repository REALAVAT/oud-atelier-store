export const CURRENCIES = ["AED", "USD", "SAR"] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Fixed demo rates relative to AED (AED is pegged to USD). */
export const RATES: Record<Currency, number> = {
  AED: 1,
  USD: 0.2723,
  SAR: 1.0211,
};

export function convert(aed: number, currency: Currency) {
  return aed * RATES[currency];
}

export function formatMoney(aed: number, currency: Currency = "AED", locale = "en") {
  const value = convert(aed, currency);
  const fractionDigits = currency === "USD" ? 2 : 0;
  return new Intl.NumberFormat(locale === "ar" ? "ar-AE-u-nu-latn" : "en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
