export type Localized = { en: string; ar: string };

export type CollectionSlug = "oud" | "floral" | "fresh" | "gift-sets";
export type ScentFamily = "oud" | "amber" | "floral" | "fresh" | "woody" | "musk";
export type Gender = "feminine" | "masculine" | "unisex";
export type Occasion = "day" | "evening" | "special" | "everyday";

export type Variant = {
  id: string;
  sizeMl: number;
  priceAed: number;
  compareAtAed?: number;
  stock: number;
  sku: string;
  label?: Localized;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  collection: CollectionSlug;
  family: ScentFamily;
  gender: Gender;
  intensity: 1 | 2 | 3 | 4 | 5;
  occasions: Occasion[];
  notes: { top: string[]; heart: string[]; base: string[] };
  images: string[];
  variants: Variant[];
  bestseller?: boolean;
  isNew?: boolean;
  featured?: boolean;
  status: "active" | "draft";
  seo: { title: Localized; description: Localized };
  rating: number;
  reviewCount: number;
  createdAt: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  location?: string;
  rating: number;
  title: string;
  body: string;
  titleAr?: string;
  bodyAr?: string;
  createdAt: string;
  verified?: boolean;
};

export type Collection = {
  slug: CollectionSlug;
  name: Localized;
  description: Localized;
  image: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_FLOW: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];

export type Emirate =
  | "dubai"
  | "abu-dhabi"
  | "sharjah"
  | "ajman"
  | "umm-al-quwain"
  | "ras-al-khaimah"
  | "fujairah";

export type Address = {
  id?: string;
  label?: string;
  fullName: string;
  phone: string;
  emirate: Emirate;
  area: string;
  street: string;
  building: string;
  notes?: string;
  isDefault?: boolean;
};

export type ShippingMethod = "standard" | "express" | "same-day";

export type OrderItem = {
  productId: string;
  slug: string;
  name: Localized;
  image: string;
  variantId: string;
  sizeMl: number;
  priceAed: number;
  quantity: number;
};

export type TimelineEvent = { status: OrderStatus; at: string; note?: string };

export type Order = {
  id: string;
  number: string;
  userId?: string | null;
  email: string;
  customerName: string;
  items: OrderItem[];
  subtotalAed: number;
  discountAed: number;
  shippingAed: number;
  giftWrapAed: number;
  totalAed: number;
  discountCode?: string | null;
  giftWrap: boolean;
  giftMessage?: string;
  shippingMethod: ShippingMethod;
  address: Address;
  status: OrderStatus;
  timeline: TimelineEvent[];
  paymentMethod: "stripe" | "demo";
  locale: "en" | "ar";
  createdAt: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotalAed?: number;
  active: boolean;
  usageCount: number;
  expiresAt?: string | null;
};

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  whatsapp: string;
  freeShippingThresholdAed: number;
  standardShippingAed: number;
  expressShippingAed: number;
  sameDayShippingAed: number;
  giftWrapAed: number;
  announcement: Localized;
  lowStockThreshold: number;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  ordersCount: number;
  totalSpentAed: number;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
};

export type EmailLog = {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
  delivered: boolean;
};
