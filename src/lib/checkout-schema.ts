import { z } from "zod";

export const EMIRATES = [
  "dubai",
  "abu-dhabi",
  "sharjah",
  "ajman",
  "umm-al-quwain",
  "ras-al-khaimah",
  "fujairah",
] as const;

export const SHIPPING_METHODS = ["standard", "express", "same-day"] as const;

/** Error messages are translation keys from the `validation` namespace. */
export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "required"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{7,15}$/, "phone"),
  emirate: z.enum(EMIRATES, { message: "required" }),
  area: z.string().trim().min(2, "required"),
  street: z.string().trim().min(2, "required"),
  building: z.string().trim().min(1, "required"),
  notes: z.string().trim().max(300).optional(),
});

export const checkoutSchema = z.object({
  email: z.email("email"),
  address: addressSchema,
  shippingMethod: z.enum(SHIPPING_METHODS),
  saveAddress: z.boolean().optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const checkoutRequestSchema = checkoutSchema.extend({
  locale: z.enum(["en", "ar"]),
  items: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1)
    .max(30),
  discountCode: z.string().trim().max(40).nullable().optional(),
  giftWrap: z.boolean(),
  giftMessage: z.string().max(240).optional(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
