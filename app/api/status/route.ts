import { NextResponse } from "next/server";
import { getInvoiceSummaries } from "@/lib/invoices";
import { calendarDaysPastDue, getEscalation } from "@/lib/escalation";
import { isTone } from "@/lib/types";
import { templateCopy } from "@/lib/copy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
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
      const escalation = paid ? null : getEscalation(tone, dueAt, now);
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
