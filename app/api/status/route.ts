import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getInvoiceSummaries } from "@/lib/invoices";
import { calendarDaysPastDue, getEscalationWithPromise } from "@/lib/escalation";
import { isTone } from "@/lib/types";
import { templateCopy } from "@/lib/copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const limit = await rateLimit(clientKey(headerList, "status"), 120, 60);
    if (!limit.ok) {
      return NextResponse.json({ invoices: [] }, { status: 429 });
    }

    const body = (await request.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((v): v is string => typeof v === "string").slice(0, 50)
      : [];
    if (ids.length === 0) return NextResponse.json({ invoices: [] });

    const rows = await getInvoiceSummaries(ids);
    const now = new Date();

    const invoices = rows.map((row) => {
      const tone = isTone(String(row.tone)) ? row.tone : "standard";
      const dueAt = new Date(row.due_at as string);
      const paid = row.status === "paid";
      const daysPastDue = paid ? 0 : calendarDaysPastDue(dueAt, now);
      const promisedAt = row.promised_at ? new Date(row.promised_at as string) : null;
      const resolved = paid ? null : getEscalationWithPromise(tone, dueAt, promisedAt, now);
      const escalation = resolved?.escalation ?? null;
      return {
        id: row.id,
        client_name: row.client_name,
        description: row.description,
        amount_cents: Number(row.amount_cents),
        currency: row.currency ?? "USD",
        due_at: dueAt.toISOString(),
        status: row.status,
        views: Number(row.views ?? 0),
        last_viewed_at: row.last_viewed_at
          ? new Date(row.last_viewed_at as string).toISOString()
          : null,
        days_past_due: daysPastDue,
        register: escalation?.register ?? null,
        promised_at: promisedAt ? promisedAt.toISOString() : null,
        promise_state: resolved?.promise.kind ?? "none",
        paused: resolved?.paused ?? false,
        // The exact wording for the stage this invoice has reached, so the
        // freelancer can send it from wherever they already talk to the client.
        message:
          escalation?.register && daysPastDue >= 0
            ? templateCopy({
                register: escalation.register,
                description: String(row.description),
                daysPastDue,
              })
            : null,
      };
    });

    return NextResponse.json({ invoices });
  } catch {
    return NextResponse.json({ invoices: [] });
  }
}
