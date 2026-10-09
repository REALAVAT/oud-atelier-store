"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Address,
  Customer,
  DiscountCode,
  EmailLog,
  Order,
  OrderStatus,
  Product,
  Review,
  StoreSettings,
} from "@/lib/types";
import { SEED_PRODUCTS } from "@/lib/data/seed-products";
import {
  SEED_CUSTOMERS,
  SEED_DISCOUNTS,
  SEED_ORDERS,
  SEED_SETTINGS,
} from "@/lib/data/seed-extra";

/**
 * Browser-side database used in demo mode. Everything a visitor or the demo admin
 * changes lives here (localStorage), layered over the seeded catalog.
 */
type DemoDb = {
  version: number;
  products: Product[] | null;
  orders: Order[];
  discounts: DiscountCode[];
  settings: StoreSettings;
  customers: Customer[];
  addresses: Record<string, Address[]>;
  reviews: Review[];
  emails: EmailLog[];
  revision: number;
  bump: () => void;
  getProducts: () => Product[];
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  createOrder: (o: Order) => void;
  setOrderStatus: (id: string, status: OrderStatus, note?: string) => Order | undefined;
  saveDiscount: (d: DiscountCode) => void;
  deleteDiscount: (id: string) => void;
  incrementDiscount: (code: string) => void;
  saveSettings: (s: StoreSettings) => void;
  upsertCustomer: (c: Omit<Customer, "ordersCount" | "totalSpentAed">) => void;
  saveAddress: (userId: string, a: Address) => void;
  deleteAddress: (userId: string, id: string) => void;
  addReview: (r: Review) => void;
  logEmail: (e: EmailLog) => void;
  reset: () => void;
};

const initial = () => ({
  version: 1,
  products: null as Product[] | null,
  orders: SEED_ORDERS,
  discounts: SEED_DISCOUNTS,
  settings: SEED_SETTINGS,
  customers: SEED_CUSTOMERS,
  addresses: {
    u_demo_customer: [
      {
        id: "a_1",
        label: "Home",
        fullName: "Aisha Al Mansouri",
        phone: "+971 50 412 8834",
        emirate: "dubai",
        area: "Downtown Dubai",
        street: "Sheikh Mohammed bin Rashid Blvd",
        building: "Burj Vista, Tower 1, Apt 2304",
        isDefault: true,
      },
    ] as Address[],
  } as Record<string, Address[]>,
  reviews: [] as Review[],
  emails: [] as EmailLog[],
  revision: 0,
});

export const useDemoDb = create<DemoDb>()(
  persist(
    (set, get) => ({
      ...initial(),
      bump: () => set((s) => ({ revision: s.revision + 1 })),
      getProducts: () => get().products ?? SEED_PRODUCTS,
      saveProduct: (p) =>
        set((s) => {
          const list = s.products ?? SEED_PRODUCTS;
          const exists = list.some((x) => x.id === p.id);
          return {
            products: exists ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list],
            revision: s.revision + 1,
          };
        }),
      deleteProduct: (id) =>
        set((s) => ({
          products: (s.products ?? SEED_PRODUCTS).filter((p) => p.id !== id),
          revision: s.revision + 1,
        })),
      createOrder: (o) =>
        set((s) => {
          const list = s.products ?? SEED_PRODUCTS;
          const products = list.map((p) => ({
            ...p,
            variants: p.variants.map((v) => {
              const line = o.items.find((i) => i.variantId === v.id);
              return line ? { ...v, stock: Math.max(0, v.stock - line.quantity) } : v;
            }),
          }));
          const known = s.customers.find((c) => c.email.toLowerCase() === o.email.toLowerCase());
          const customers = known
            ? s.customers.map((c) =>
                c.id === known.id
                  ? { ...c, ordersCount: c.ordersCount + 1, totalSpentAed: c.totalSpentAed + o.totalAed }
                  : c,
              )
            : [
                {
                  id: o.userId ?? `c_guest_${o.id}`,
                  name: o.customerName,
                  email: o.email,
                  phone: o.address.phone,
                  createdAt: o.createdAt,
                  ordersCount: 1,
                  totalSpentAed: o.totalAed,
                },
                ...s.customers,
              ];
          return { orders: [o, ...s.orders], products, customers, revision: s.revision + 1 };
        }),
      setOrderStatus: (id, status, note) => {
        let updated: Order | undefined;
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            updated = {
              ...o,
              status,
              timeline: [...o.timeline, { status, at: new Date().toISOString(), note }],
            };
            return updated;
          }),
          revision: s.revision + 1,
        }));
        return updated;
      },
      saveDiscount: (d) =>
        set((s) => ({
          discounts: s.discounts.some((x) => x.id === d.id)
            ? s.discounts.map((x) => (x.id === d.id ? d : x))
            : [d, ...s.discounts],
          revision: s.revision + 1,
        })),
      deleteDiscount: (id) =>
        set((s) => ({ discounts: s.discounts.filter((d) => d.id !== id), revision: s.revision + 1 })),
      incrementDiscount: (code) =>
        set((s) => ({
          discounts: s.discounts.map((d) =>
            d.code.toUpperCase() === code.toUpperCase() ? { ...d, usageCount: d.usageCount + 1 } : d,
          ),
        })),
      saveSettings: (settings) => set((s) => ({ settings, revision: s.revision + 1 })),
      upsertCustomer: (c) =>
        set((s) => ({
          customers: s.customers.some((x) => x.id === c.id || x.email === c.email)
            ? s.customers
            : [{ ...c, ordersCount: 0, totalSpentAed: 0 }, ...s.customers],
        })),
      saveAddress: (userId, a) =>
        set((s) => {
          const list = s.addresses[userId] ?? [];
          const withId = { ...a, id: a.id ?? `a_${Date.now()}` };
          let next = list.some((x) => x.id === withId.id)
            ? list.map((x) => (x.id === withId.id ? withId : x))
            : [...list, withId];
          if (withId.isDefault || next.length === 1) {
            next = next.map((x) => ({ ...x, isDefault: x.id === withId.id }));
          }
          return { addresses: { ...s.addresses, [userId]: next }, revision: s.revision + 1 };
        }),
      deleteAddress: (userId, id) =>
        set((s) => ({
          addresses: { ...s.addresses, [userId]: (s.addresses[userId] ?? []).filter((a) => a.id !== id) },
          revision: s.revision + 1,
        })),
      addReview: (r) => set((s) => ({ reviews: [r, ...s.reviews], revision: s.revision + 1 })),
      logEmail: (e) => set((s) => ({ emails: [e, ...s.emails].slice(0, 50), revision: s.revision + 1 })),
      reset: () => set({ ...initial(), revision: get().revision + 1 }),
    }),
    {
      name: "oud-atelier-demo-db",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ revision: _r, ...rest }) => rest,
    },
  ),
);
