import { ensureDb } from "./db";
import type { Invoice, Status, Tone } from "./types";
import { isTone } from "./types";

type InvoiceRow = {
  id: string;
  freelancer_name: string;
  client_name: string;
  client_email: string;
  description: string;
  amount_cents: number;
  currency: string;
  issued_at: string | Date;
  due_at: string | Date;
  tone: string;
  status: string;
  paid_at: string | Date | null;
  promised_at?: string | Date | null;
};

const EXAMPLE_IDS = ["bk_expaid", "bk_exdue2", "bk_exlate"] as const;
const DAY = 86_400_000;

function asDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

function parseInvoice(row: InvoiceRow): Invoice {
  const tone = isTone(row.tone) ? row.tone : "standard";
  const status: Status = row.status === "paid" ? "paid" : "sent";
  return {
    id: row.id,
    freelancer_name: row.freelancer_name,
    client_name: row.client_name,
    client_email: row.client_email,
    description: row.description,
    amount_cents: Number(row.amount_cents),
    currency: row.currency || "USD",
    issued_at: asDate(row.issued_at),
    due_at: asDate(row.due_at),
    tone,
    status,
    paid_at: row.paid_at ? asDate(row.paid_at) : null,
    promised_at: row.promised_at ? asDate(row.promised_at) : null,
  };
}

export function exampleInvoices(now = new Date()) {
  return [
    {
      id: "bk_expaid",
      freelancer_name: "Nusrat Rahman",
      client_name: "Northline Studio",
      client_email: "accounts@northline.example",
      description: "Brand identity for the spring collection",
      amount_cents: 185000,
      currency: "USD",
      issued_at: new Date(now.getTime() - 24 * DAY),
      due_at: new Date(now.getTime() - 10 * DAY),
      tone: "standard" as const,
      status: "paid" as const,
      paid_at: new Date(now.getTime() - 8 * DAY),
      label: "paid — the ladder stopped",
    },
    {
      id: "bk_exdue2",
      freelancer_name: "Arif Chowdhury",
      client_name: "Harbor & Co",
      client_email: "pay@harborco.example",
      description: "Editorial photography for the Q3 lookbook",
      amount_cents: 240000,
      currency: "USD",
      issued_at: new Date(now.getTime() - 5 * DAY),
      due_at: new Date(now.getTime() + 2 * DAY),
      tone: "gentle" as const,
      status: "sent" as const,
      paid_at: null,
      label: "promised for a date — the ladder is paused",
    },
    {
      id: "bk_exlate",
      freelancer_name: "Farhana Islam",
      client_name: "Pike Meridian",
      client_email: "finance@pikemeridian.example",
      description: "Product landing page design and front-end build",
      amount_cents: 420000,
      currency: "USD",
      issued_at: new Date(now.getTime() - 26 * DAY),
      due_at: new Date(now.getTime() - 12 * DAY),
      tone: "relentless" as const,
      status: "sent" as const,
      paid_at: null,
      label: "12 days overdue — read the final notice",
    },
  ];
}

async function upsertExamples(resetStatus: boolean): Promise<void> {
  const sql = await ensureDb();
  const examples = exampleInvoices();

  for (const invoice of examples) {
    const paidAt = invoice.paid_at ? invoice.paid_at.toISOString() : null;
    if (resetStatus) {
      await sql`
        INSERT INTO invoices (
          id, freelancer_name, client_name, client_email, description,
          amount_cents, currency, issued_at, due_at, tone, status, paid_at
        )
        VALUES (
          ${invoice.id},
          ${invoice.freelancer_name},
          ${invoice.client_name},
          ${invoice.client_email},
          ${invoice.description},
          ${invoice.amount_cents},
          ${invoice.currency},
          ${invoice.issued_at.toISOString()},
          ${invoice.due_at.toISOString()},
          ${invoice.tone},
          ${invoice.status},
          ${paidAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          freelancer_name = EXCLUDED.freelancer_name,
          client_name = EXCLUDED.client_name,
          client_email = EXCLUDED.client_email,
          description = EXCLUDED.description,
          amount_cents = EXCLUDED.amount_cents,
          currency = EXCLUDED.currency,
          issued_at = EXCLUDED.issued_at,
          due_at = EXCLUDED.due_at,
          tone = EXCLUDED.tone,
          status = EXCLUDED.status,
          paid_at = EXCLUDED.paid_at
      `;
    } else {
      await sql`
        INSERT INTO invoices (
          id, freelancer_name, client_name, client_email, description,
          amount_cents, currency, issued_at, due_at, tone, status, paid_at
        )
        VALUES (
          ${invoice.id},
          ${invoice.freelancer_name},
          ${invoice.client_name},
          ${invoice.client_email},
          ${invoice.description},
          ${invoice.amount_cents},
          ${invoice.currency},
          ${invoice.issued_at.toISOString()},
          ${invoice.due_at.toISOString()},
          ${invoice.tone},
          ${invoice.status},
          ${paidAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          freelancer_name = EXCLUDED.freelancer_name,
          client_name = EXCLUDED.client_name,
          client_email = EXCLUDED.client_email,
          description = EXCLUDED.description,
          amount_cents = EXCLUDED.amount_cents,
          currency = EXCLUDED.currency,
          issued_at = EXCLUDED.issued_at,
          due_at = EXCLUDED.due_at,
          tone = EXCLUDED.tone
      `;
    }
  }
}

export async function seedExamples(): Promise<void> {
  await upsertExamples(true);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  await upsertExamples(false);
  const sql = await ensureDb();
  const rows = (await sql`
    SELECT * FROM invoices WHERE id = ${id} LIMIT 1
  `) as InvoiceRow[];
  return rows[0] ? parseInvoice(rows[0]) : null;
}

export async function createInvoiceRecord(input: {
  freelancer_name: string;
  client_name: string;
  client_email: string;
  description: string;
  amount_cents: number;
  due_at: Date;
  tone: Tone;
  id: string;
}): Promise<Invoice> {
  const sql = await ensureDb();
  const rows = (await sql`
    INSERT INTO invoices (
      id, freelancer_name, client_name, client_email, description,
      amount_cents, currency, due_at, tone, status
    )
    VALUES (
      ${input.id},
      ${input.freelancer_name},
      ${input.client_name},
      ${input.client_email},
      ${input.description},
      ${input.amount_cents},
      ${"USD"},
      ${input.due_at.toISOString()},
      ${input.tone},
      ${"sent"}
    )
    RETURNING *
  `) as InvoiceRow[];
  return parseInvoice(rows[0]);
}

export async function markInvoicePaid(id: string): Promise<Invoice | null> {
  const sql = await ensureDb();
  const rows = (await sql`
    UPDATE invoices
    SET status = 'paid', paid_at = now()
    WHERE id = ${id} AND status = 'sent'
    RETURNING *
  `) as InvoiceRow[];
  if (rows[0]) return parseInvoice(rows[0]);
  return getInvoice(id);
}

export { EXAMPLE_IDS };

/**
 * Client opened the invoice. Owner previews (?new=1) are not counted.
 *
 * The example invoices count too. Anyone opening one is a real reader, and
 * watching your own visit appear on the overview is the clearest possible
 * demonstration of what the column is for.
 */
export async function recordInvoiceView(id: string): Promise<void> {
  try {
    const sql = await ensureDb();
    await sql`
      UPDATE invoices
      SET views = COALESCE(views, 0) + 1, last_viewed_at = now()
      WHERE id = ${id}
    `;
  } catch {
    // View counting is never allowed to break the invoice page.
  }
}

/** Status for a batch of ids, for the freelancer's local history list. */
export async function getInvoiceSummaries(ids: string[]) {
  if (ids.length === 0) return [];
  const sql = await ensureDb();
  const rows = await sql`
    SELECT id, client_name, description, amount_cents, currency,
           due_at, tone, status, paid_at, COALESCE(views, 0) AS views, last_viewed_at,
           promised_at
    FROM invoices
    WHERE id = ANY(${ids})
    ORDER BY issued_at DESC
  `;
  return rows;
}

/** The client commits to a date. Escalation pauses until it passes. */
export async function promisePayment(id: string, at: Date): Promise<void> {
  const sql = await ensureDb();
  await sql`UPDATE invoices SET promised_at = ${at.toISOString()} WHERE id = ${id} AND status <> 'paid'`;
}
