import { randomBytes } from "node:crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function makeInvoiceId(): string {
  const bytes = randomBytes(5);
  let slug = "";
  for (const byte of bytes) {
    slug += ALPHABET[byte % ALPHABET.length];
  }
  return `bk_${slug}`;
}
