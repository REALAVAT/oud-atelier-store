"use client";

import type { Repo } from "./types";
import { useDemoDb } from "@/stores/demo-db";

const db = () => useDemoDb.getState();

const latency = <T,>(value: T, ms = 180) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function compress(file: File, maxSize = 1200): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  try {
    const img = document.createElement("img");
    img.src = dataUrl;
    await img.decode();
    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return dataUrl;
  }
}

export const demoRepo: Repo = {
  listProducts: () => latency(db().getProducts()),
  saveProduct: async (p) => {
    db().saveProduct(p);
    return latency(p);
  },
  deleteProduct: async (id) => {
    db().deleteProduct(id);
    await latency(null);
  },
  uploadImage: (file) => compress(file),

  listOrders: () => latency([...db().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  getOrder: (id) => latency(db().orders.find((o) => o.id === id || o.number === id) ?? null),
  listMyOrders: (userId, email) =>
    latency(
      db()
        .orders.filter((o) => o.userId === userId || o.email.toLowerCase() === email.toLowerCase())
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
  updateOrderStatus: async (id, status, note) => latency(db().setOrderStatus(id, status, note) ?? null),

  listCustomers: () => latency(db().customers),

  listDiscounts: () => latency(db().discounts),
  saveDiscount: async (d) => {
    db().saveDiscount(d);
    await latency(null);
  },
  deleteDiscount: async (id) => {
    db().deleteDiscount(id);
    await latency(null);
  },

  getSettings: () => latency(db().settings, 60),
  saveSettings: async (s) => {
    db().saveSettings(s);
    await latency(null);
  },

  listAddresses: (userId) => latency(db().addresses[userId] ?? [], 80),
  saveAddress: async (userId, a) => {
    db().saveAddress(userId, a);
    await latency(null);
  },
  deleteAddress: async (userId, id) => {
    db().deleteAddress(userId, id);
    await latency(null);
  },

  listReviews: (productId) => latency(db().reviews.filter((r) => r.productId === productId), 0),
  addReview: async (r) => {
    db().addReview(r);
    await latency(null);
  },

  listEmails: () => latency(db().emails),
};
