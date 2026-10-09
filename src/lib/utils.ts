import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
