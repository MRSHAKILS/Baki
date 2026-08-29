"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { dollarsToCents, parseDateInput } from "@/lib/format";
import { makeInvoiceId } from "@/lib/ids";
import { createInvoiceRecord, markInvoicePaid, promisePayment } from "@/lib/invoices";
import { isTone } from "@/lib/types";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Nobody needs a 40kb client name. Caps keep a single write bounded. */
const MAX = { name: 120, email: 200, description: 500 } as const;

export async function createInvoice(formData: FormData) {
  const headerList = await headers();
  const limit = await rateLimit(clientKey(headerList, "create"), 12, 3600);
  if (!limit.ok) redirect("/new?error=rate");

  const freelancer_name = asString(formData.get("freelancer_name"));
  const client_name = asString(formData.get("client_name"));
  const client_email = asString(formData.get("client_email"));
  const description = asString(formData.get("description"));
  const amountRaw = asString(formData.get("amount"));
  const dueRaw = asString(formData.get("due_at"));
  const toneRaw = asString(formData.get("tone"));

  const amount_cents = dollarsToCents(amountRaw);
  const due_at = parseDateInput(dueRaw);

  const tooLong =
    freelancer_name.length > MAX.name ||
    client_name.length > MAX.name ||
    client_email.length > MAX.email ||
    description.length > MAX.description;
  if (tooLong) redirect("/new?error=1");

  if (
    !freelancer_name ||
    !client_name ||
    !client_email ||
    !description ||
    amount_cents === null ||
    !due_at ||
    !isTone(toneRaw)
  ) {
    redirect("/new?error=1");
  }

  const invoice = await createInvoiceRecord({
    id: makeInvoiceId(),
    freelancer_name,
    client_name,
    client_email,
    description,
    amount_cents,
    due_at,
    tone: toneRaw,
  });

  redirect(`/invoice/${invoice.id}?new=1`);
}

export async function confirmPayment(formData: FormData) {
  const id = asString(formData.get("id"));
  if (!id) redirect("/");
  await markInvoicePaid(id);
  redirect(`/invoice/${id}`);
}

export async function promiseDate(formData: FormData) {
  const headerList = await headers();
  const limit = await rateLimit(clientKey(headerList, "promise"), 20, 3600);
  const id = asString(formData.get("id"));
  if (!limit.ok) redirect(id ? `/invoice/${id}` : "/");
  const when = parseDateInput(asString(formData.get("promised_at")));
  if (!id || !when) redirect(id ? `/invoice/${id}` : "/");
  await promisePayment(id, when);
  redirect(`/invoice/${id}`);
}
