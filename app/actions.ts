"use server";

import { redirect } from "next/navigation";
import { dollarsToCents, parseDateInput } from "@/lib/format";
import { makeInvoiceId } from "@/lib/ids";
import { createInvoiceRecord, markInvoicePaid } from "@/lib/invoices";
import { isTone } from "@/lib/types";

function asString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function createInvoice(formData: FormData) {
  const freelancer_name = asString(formData.get("freelancer_name"));
  const client_name = asString(formData.get("client_name"));
  const client_email = asString(formData.get("client_email"));
  const description = asString(formData.get("description"));
  const amountRaw = asString(formData.get("amount"));
  const dueRaw = asString(formData.get("due_at"));
  const toneRaw = asString(formData.get("tone"));

  const amount_cents = dollarsToCents(amountRaw);
  const due_at = parseDateInput(dueRaw);

  if (
    !freelancer_name ||
    !client_name ||
    !client_email ||
    !description ||
    amount_cents === null ||
    !due_at ||
    !isTone(toneRaw)
  ) {
    redirect("/?error=1");
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
