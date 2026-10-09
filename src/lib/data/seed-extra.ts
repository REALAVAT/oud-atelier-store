import type {
  Customer,
  DiscountCode,
  Order,
  OrderStatus,
  Review,
  StoreSettings,
  TimelineEvent,
  Emirate,
  ShippingMethod,
} from "@/lib/types";
import { SEED_PRODUCTS } from "./seed-products";

const reviewers = [
  { author: "Fatima A.", location: "Dubai" },
  { author: "James R.", location: "Abu Dhabi" },
  { author: "Noura K.", location: "Sharjah" },
  { author: "Omar H.", location: "Dubai" },
  { author: "Sophie L.", location: "Dubai Marina" },
  { author: "Khalid M.", location: "Al Ain" },
  { author: "Priya S.", location: "Jumeirah" },
  { author: "Mariam S.", location: "Riyadh" },
  { author: "Elena V.", location: "Abu Dhabi" },
  { author: "Rashid B.", location: "Ras Al Khaimah" },
  { author: "Layla T.", location: "Doha" },
  { author: "Daniel W.", location: "Downtown Dubai" },
];

const reviewTexts = [
  {
    rating: 5,
    title: "Absolutely stunning",
    body: "I get compliments every single time I wear it. The longevity is incredible — still there the next morning.",
    titleAr: "مذهل بكل معنى الكلمة",
    bodyAr: "أتلقى المديح في كل مرة أضعه فيها. ثباته مدهش — ما زال موجوداً في صباح اليوم التالي.",
  },
  {
    rating: 5,
    title: "My new signature",
    body: "Elegant without being loud. The packaging feels like opening a piece of jewellery.",
    titleAr: "عطري المميّز الجديد",
    bodyAr: "أنيق دون مبالغة. التغليف يشعرك وكأنك تفتح قطعة مجوهرات.",
  },
  {
    rating: 4,
    title: "Beautiful, slightly strong at first",
    body: "The opening is intense but it settles into something really refined after twenty minutes.",
    titleAr: "جميل، وقوي قليلاً في البداية",
    bodyAr: "الافتتاحية قوية لكنها تهدأ وتتحول إلى شيء راقٍ جداً بعد عشرين دقيقة.",
  },
  {
    rating: 5,
    title: "Worth every dirham",
    body: "Delivered the same day in Dubai, beautifully wrapped. The scent is rich and complex.",
    titleAr: "يستحق كل درهم",
    bodyAr: "وصل في اليوم نفسه داخل دبي بتغليف رائع. الرائحة غنية ومتعددة الطبقات.",
  },
  {
    rating: 5,
    title: "Gifted it to my mother",
    body: "She loved it so much she asked where to buy a second bottle. Truly luxurious.",
    titleAr: "أهديته لوالدتي",
    bodyAr: "أحبته كثيراً لدرجة أنها سألت من أين تشتري زجاجة ثانية. فخامة حقيقية.",
  },
  {
    rating: 4,
    title: "Lovely everyday luxury",
    body: "Soft, warm and long-lasting. I would love a travel size in every scent.",
    titleAr: "فخامة يومية رائعة",
    bodyAr: "ناعم ودافئ ويدوم طويلاً. أتمنى حجم سفر لكل العطور.",
  },
  {
    rating: 5,
    title: "Smells like a five-star hotel",
    body: "Sophisticated and memorable. Customer service on WhatsApp was quick and helpful.",
    titleAr: "رائحة فندق خمس نجوم",
    bodyAr: "راقٍ ولا يُنسى. خدمة العملاء عبر واتساب كانت سريعة ومفيدة.",
  },
];

function seeded(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const SEED_REVIEWS: Review[] = SEED_PRODUCTS.flatMap((p, pi) =>
  Array.from({ length: 4 }, (_, ri) => {
    const r = reviewers[(pi * 3 + ri) % reviewers.length];
    const t = reviewTexts[(pi + ri * 2) % reviewTexts.length];
    const daysAgo = 4 + Math.floor(seeded(pi * 10 + ri) * 160);
    return {
      id: `r_${p.id}_${ri}`,
      productId: p.id,
      author: r.author,
      location: r.location,
      rating: t.rating,
      title: t.title,
      body: t.body,
      titleAr: t.titleAr,
      bodyAr: t.bodyAr,
      verified: true,
      createdAt: new Date(Date.UTC(2026, 9, 1) - daysAgo * 86400000).toISOString(),
    };
  }),
);

export const SEED_SETTINGS: StoreSettings = {
  storeName: "Oud Atelier",
  supportEmail: "concierge@oudatelier.ae",
  whatsapp: "971500000000",
  freeShippingThresholdAed: 300,
  standardShippingAed: 25,
  expressShippingAed: 45,
  sameDayShippingAed: 65,
  giftWrapAed: 30,
  announcement: {
    en: "Complimentary delivery across the UAE on orders over AED 300",
    ar: "توصيل مجاني داخل الإمارات للطلبات فوق ٣٠٠ درهم",
  },
  lowStockThreshold: 5,
};

export const SEED_DISCOUNTS: DiscountCode[] = [
  { id: "d_1", code: "WELCOME10", type: "percent", value: 10, active: true, usageCount: 184 },
  { id: "d_2", code: "OUD20", type: "percent", value: 20, minSubtotalAed: 800, active: true, usageCount: 41 },
  { id: "d_3", code: "EID100", type: "fixed", value: 100, minSubtotalAed: 600, active: true, usageCount: 63, expiresAt: "2027-04-30T00:00:00.000Z" },
  { id: "d_4", code: "RAMADAN15", type: "percent", value: 15, active: false, usageCount: 220, expiresAt: "2026-04-01T00:00:00.000Z" },
];

const customerSeeds = [
  ["Aisha Al Mansouri", "aisha.m@example.ae", "+971 50 412 8834", "dubai"],
  ["James Whitfield", "james.w@example.com", "+971 55 901 2231", "dubai"],
  ["Noura Al Hashimi", "noura.h@example.ae", "+971 52 330 1190", "abu-dhabi"],
  ["Rahul Mehta", "rahul.mehta@example.com", "+971 56 774 0021", "sharjah"],
  ["Sophie Laurent", "sophie.l@example.fr", "+971 50 118 6672", "dubai"],
  ["Khalid Al Suwaidi", "khalid.s@example.ae", "+971 50 223 9981", "abu-dhabi"],
  ["Mariam Al Qasimi", "mariam.q@example.ae", "+971 54 662 1043", "ras-al-khaimah"],
  ["Elena Petrova", "elena.p@example.com", "+971 58 993 4410", "dubai"],
  ["Omar Haddad", "omar.h@example.com", "+971 55 440 7782", "ajman"],
  ["Layla Farouk", "layla.f@example.com", "+971 52 871 3365", "fujairah"],
  ["Daniel Brooks", "daniel.b@example.co.uk", "+971 50 765 2209", "dubai"],
  ["Hessa Al Ketbi", "hessa.k@example.ae", "+971 56 202 8890", "umm-al-quwain"],
] as const;

const areas: Record<Emirate, string> = {
  dubai: "Downtown Dubai",
  "abu-dhabi": "Al Reem Island",
  sharjah: "Al Majaz",
  ajman: "Al Nuaimiya",
  "umm-al-quwain": "Al Salamah",
  "ras-al-khaimah": "Al Hamra",
  fujairah: "Dibba",
};

function buildTimeline(status: OrderStatus, created: Date): TimelineEvent[] {
  const steps: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];
  if (status === "cancelled") {
    return [
      { status: "paid", at: created.toISOString() },
      { status: "cancelled", at: new Date(created.getTime() + 5 * 3600000).toISOString() },
    ];
  }
  const idx = steps.indexOf(status);
  return steps.slice(0, idx + 1).map((s, i) => ({
    status: s,
    at: new Date(created.getTime() + i * 26 * 3600000).toISOString(),
  }));
}

const statuses: OrderStatus[] = ["delivered", "delivered", "shipped", "processing", "paid", "delivered", "cancelled", "delivered"];
const methods: ShippingMethod[] = ["standard", "express", "same-day"];

/** Orders are dated relative to now so the dashboard always shows recent activity. */
const ORDER_ANCHOR = Math.floor(Date.now() / 3600000) * 3600000 - 2 * 3600000;

export const SEED_ORDERS: Order[] = Array.from({ length: 42 }, (_, i) => {
  const c = customerSeeds[i % customerSeeds.length];
  const daysAgo = Math.floor(i * 2.1 + seeded(i) * 2);
  const created = new Date(ORDER_ANCHOR - daysAgo * 86400000 - Math.floor(seeded(i + 99) * 10) * 3600000);
  const itemCount = 1 + Math.floor(seeded(i + 7) * 3);
  const items = Array.from({ length: itemCount }, (_, k) => {
    const p = SEED_PRODUCTS[Math.floor(seeded(i * 5 + k) * SEED_PRODUCTS.length)];
    const v = p.variants[Math.min(p.variants.length - 1, 1)];
    return {
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0],
      variantId: v.id,
      sizeMl: v.sizeMl,
      priceAed: v.priceAed,
      quantity: 1 + (seeded(i + k) > 0.8 ? 1 : 0),
    };
  });
  const subtotal = items.reduce((s, it) => s + it.priceAed * it.quantity, 0);
  const method = methods[i % 3];
  const shipping = subtotal >= 300 && method === "standard" ? 0 : method === "standard" ? 25 : method === "express" ? 45 : 65;
  const discount = i % 5 === 0 ? Math.round(subtotal * 0.1) : 0;
  const giftWrap = i % 4 === 0;
  const status = i < 3 ? (["paid", "processing", "paid"] as OrderStatus[])[i] : statuses[i % statuses.length];
  const emirate = c[3] as Emirate;
  return {
    id: `o_${String(1042 - i)}`,
    number: `OA-${1042 - i}`,
    userId: i % customerSeeds.length === 0 ? "u_demo_customer" : `c_${i % customerSeeds.length}`,
    email: c[1],
    customerName: c[0],
    items,
    subtotalAed: subtotal,
    discountAed: discount,
    shippingAed: shipping,
    giftWrapAed: giftWrap ? 30 : 0,
    totalAed: subtotal - discount + shipping + (giftWrap ? 30 : 0),
    discountCode: discount ? "WELCOME10" : null,
    giftWrap,
    shippingMethod: method,
    address: {
      fullName: c[0],
      phone: c[2],
      emirate,
      area: areas[emirate],
      street: `${12 + i} Al Wasl Street`,
      building: `Villa ${3 + (i % 40)}`,
    },
    status,
    timeline: buildTimeline(status, created),
    paymentMethod: "stripe",
    locale: i % 3 === 0 ? "ar" : "en",
    createdAt: created.toISOString(),
  };
});

export const SEED_CUSTOMERS: Customer[] = customerSeeds.map((c, i) => {
  const id = i === 0 ? "u_demo_customer" : `c_${i}`;
  const orders = SEED_ORDERS.filter((o) => o.userId === id && o.status !== "cancelled");
  return {
    id,
    name: c[0],
    email: c[1],
    phone: c[2],
    createdAt: new Date(Date.UTC(2025, 6 + i, 3 + i)).toISOString(),
    ordersCount: orders.length,
    totalSpentAed: orders.reduce((s, o) => s + o.totalAed, 0),
  };
});
