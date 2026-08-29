"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { forgetAll, readHistory } from "@/lib/history";
import { formatMoney } from "@/lib/format";

type Summary = {
  id: string;
  client_name: string;
  description: string;
  amount_cents: number;
  currency: string;
  status: "sent" | "paid";
  views: number;
  days_past_due: number;
  register: string | null;
};

function stateLabel(s: Summary): { text: string; tone: string } {
  if (s.status === "paid") return { text: "paid", tone: "text-paid" };
  if (s.days_past_due > 0) {
    const stage = s.register ? ` · ${s.register}` : "";
    return {
      text: `${s.days_past_due} day${s.days_past_due === 1 ? "" : "s"} overdue${stage}`,
      tone: "text-overdue",
    };
  }
  return { text: "not yet due", tone: "text-due" };
}

export function YourInvoices() {
  const [rows, setRows] = useState<Summary[] | null>(null);

  useEffect(() => {
    const ids = readHistory();
    if (ids.length === 0) {
      setRows([]);
      return;
    }
    fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d.invoices) ? d.invoices : []))
      .catch(() => setRows([]));
  }, []);

  if (rows === null || rows.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[12px] tracking-[0.18em] text-muted uppercase">Your invoices</h2>
        <button
          type="button"
          onClick={() => {
            forgetAll();
            setRows([]);
          }}
          className="text-[12px] text-muted underline underline-offset-4"
        >
          Clear
        </button>
      </div>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-surface/70">
        Remembered in this browser only. Baki has no accounts.
      </p>
      <ul className="mt-6">
        {rows.map((row) => {
          const state = stateLabel(row);
          return (
            <li key={row.id} className="border-b border-surface/15 py-5">
              <Link href={`/invoice/${row.id}`} className="block">
                <p className={`text-[12px] tracking-[0.04em] ${state.tone}`}>
                  {state.text}
                  {row.views > 0 ? (
                    <span className="text-muted">
                      {" "}
                      · opened {row.views} time{row.views === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="text-muted"> · not opened yet</span>
                  )}
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <p className="font-serif text-[22px] leading-snug tracking-tight">
                    {row.description}
                  </p>
                  <p className="shrink-0 font-serif text-[20px] tracking-tight tabular-nums">
                    {formatMoney(row.amount_cents, row.currency)}
                  </p>
                </div>
                <p className="mt-1 text-[13px] text-muted">{row.client_name}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
