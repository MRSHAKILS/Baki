"use client";

/**
 * Invoices you created, remembered in this browser only.
 * Baki has no accounts, so history is per-device rather than per-user.
 */
const KEY = "baki.history.v1";
const MAX = 50;

export function readHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

export function rememberInvoice(id: string): void {
  try {
    const existing = readHistory().filter((v) => v !== id);
    window.localStorage.setItem(KEY, JSON.stringify([id, ...existing].slice(0, MAX)));
  } catch {
    // Private browsing or blocked storage. History is a convenience, not a requirement.
  }
}

export function forgetAll(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
