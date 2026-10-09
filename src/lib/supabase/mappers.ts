import type {
  Address,
  Customer,
  DiscountCode,
  Order,
  Product,
  Review,
  StoreSettings,
  Variant,
} from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export function rowToVariant(r: Row): Variant {
  return {
    id: r.id,
    sizeMl: r.size_ml,
    priceAed: Number(r.price_aed),
    compareAtAed: r.compare_at_aed ? Number(r.compare_at_aed) : undefined,
    stock: r.stock,
    sku: r.sku,
    label: r.label ?? undefined,
  };
}

export function rowToProduct(r: Row): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline,
    description: r.description,
    collection: r.collection,
    family: r.family,
    gender: r.gender,
    intensity: r.intensity,
    occasions: r.occasions ?? [],
    notes: r.notes,
    images: r.images ?? [],
    variants: ((r.product_variants ?? []) as Row[])
      .map(rowToVariant)
      .sort((a, b) => a.sizeMl - b.sizeMl),
    bestseller: r.bestseller,
    isNew: r.is_new,
    featured: r.featured,
    status: r.status,
    seo: r.seo,
    rating: Number(r.rating ?? 0),
    reviewCount: r.review_count ?? 0,
    createdAt: r.created_at,
  };
}

export function productToRow(p: Product) {
  return {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    collection: p.collection,
    family: p.family,
    gender: p.gender,
    intensity: p.intensity,
    occasions: p.occasions,
    notes: p.notes,
    images: p.images,
    bestseller: !!p.bestseller,
    is_new: !!p.isNew,
    featured: !!p.featured,
    status: p.status,
    seo: p.seo,
    rating: p.rating,
    review_count: p.reviewCount,
  };
}

export function variantToRow(v: Variant, productId: string) {
  return {
    product_id: productId,
    size_ml: v.sizeMl,
    price_aed: v.priceAed,
    compare_at_aed: v.compareAtAed ?? null,
    stock: v.stock,
    sku: v.sku,
    label: v.label ?? null,
  };
}

export function rowToReview(r: Row): Review {
  return {
    id: r.id,
    productId: r.product_id,
    author: r.author,
    location: r.location ?? undefined,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    createdAt: r.created_at,
  };
}

export function rowToOrder(r: Row): Order {
  return {
    id: r.id,
    number: r.number,
    userId: r.user_id,
    email: r.email,
    customerName: r.customer_name,
    items: r.items,
    subtotalAed: Number(r.subtotal_aed),
    discountAed: Number(r.discount_aed),
    shippingAed: Number(r.shipping_aed),
    giftWrapAed: Number(r.gift_wrap_aed),
    totalAed: Number(r.total_aed),
    discountCode: r.discount_code,
    giftWrap: r.gift_wrap,
    giftMessage: r.gift_message ?? undefined,
    shippingMethod: r.shipping_method,
    address: r.address,
    status: r.status,
    timeline: ((r.order_status_events ?? []) as Row[])
      .map((e) => ({ status: e.status, at: e.created_at, note: e.note ?? undefined }))
      .sort((a, b) => a.at.localeCompare(b.at)),
    paymentMethod: r.payment_method,
    locale: r.locale,
    createdAt: r.created_at,
  };
}

export function rowToDiscount(r: Row): DiscountCode {
  return {
    id: r.id,
    code: r.code,
    type: r.type,
    value: Number(r.value),
    minSubtotalAed: r.min_subtotal_aed ? Number(r.min_subtotal_aed) : undefined,
    active: r.active,
    usageCount: r.usage_count,
    expiresAt: r.expires_at,
  };
}

export function discountToRow(d: DiscountCode) {
  return {
    code: d.code.toUpperCase(),
    type: d.type,
    value: d.value,
    min_subtotal_aed: d.minSubtotalAed ?? null,
    active: d.active,
    expires_at: d.expiresAt || null,
  };
}

export function rowToAddress(r: Row): Address {
  return {
    id: r.id,
    label: r.label ?? undefined,
    fullName: r.full_name,
    phone: r.phone,
    emirate: r.emirate,
    area: r.area,
    street: r.street,
    building: r.building,
    notes: r.notes ?? undefined,
    isDefault: r.is_default,
  };
}

export function addressToRow(a: Address, userId: string) {
  return {
    user_id: userId,
    label: a.label ?? null,
    full_name: a.fullName,
    phone: a.phone,
    emirate: a.emirate,
    area: a.area,
    street: a.street,
    building: a.building,
    notes: a.notes ?? null,
    is_default: !!a.isDefault,
  };
}

export function rowToCustomer(r: Row): Customer {
  return {
    id: r.id,
    name: r.full_name ?? r.email,
    email: r.email,
    phone: r.phone ?? undefined,
    createdAt: r.created_at,
    ordersCount: Number(r.orders_count ?? 0),
    totalSpentAed: Number(r.total_spent_aed ?? 0),
  };
}

export function rowToSettings(r: Row | null, fallback: StoreSettings): StoreSettings {
  if (!r?.data) return fallback;
  return { ...fallback, ...(r.data as Partial<StoreSettings>) };
}
