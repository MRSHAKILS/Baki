"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { forgetAll, readHistory } from "@/lib/history";
import { formatMoney } from "@/lib/format";
import { CountUp } from "@/components/CountUp";

const DEMO_IDS = ["bk_exlate", "bk_exdue2", "bk_expaid"];

type Row = {
  id: string;
  client_name: string;
  description: string;
  amount_cents: number;
  currency: string;
  status: "sent" | "paid";
  views: number;
  days_past_due: number;
  register: string | null;
  due_at: string;
};

function state(row: Row): { text: string; tone: string } {
  if (row.status === "paid") return { text: "Paid", tone: "text-paid" };
  if (row.days_past_due > 0) {
    return {
      text: `${row.days_past_due} day${row.days_past_due === 1 ? "" : "s"} overdue`,
      tone: "text-overdue",
    };
  }
  const days = Math.abs(row.days_past_due);
  return { text: days === 0 ? "Due today" : `Due in ${days} days`, tone: "text-due" };
}

function Stat({
  label,
  cents,
  tone,
  index = 0,
}: {
  label: string;
  cents: number;
  tone?: string;
  index?: number;
}) {
  return (
    <div className="enter border-t border-surface/15 pt-4" style={{ ["--i" as string]: index }}>
      <p className="text-[11px] tracking-[0.16em] text-muted uppercase">{label}</p>
      <p className={`mt-2 font-serif text-[30px] tracking-tight tabular-nums ${tone ?? ""}`}>
        <CountUp cents={cents} />
      </p>
    </div>
  );
}

export function Dashboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [demo, setDemo] = useState(false);

  function load(ids: string[], isDemo: boolean) {
    setDemo(isDemo);
    fetch("/api/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    })
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d.invoices) ? d.invoices : []))
      .catch(() => setRows([]));
  }

  useEffect(() => {
    const ids = readHistory();
    load(ids.length > 0 ? ids : DEMO_IDS, ids.length === 0);
  }, []);

  if (rows === null) {
    return <p className="text-[14px] text-muted">Reading this device&apos;s history…</p>;
  }

  const unpaid = rows.filter((r) => r.status !== "paid");
  const overdue = unpaid.filter((r) => r.days_past_due > 0);
  const outstanding = unpaid.reduce((n, r) => n + r.amount_cents, 0);
  const overdueTotal = overdue.reduce((n, r) => n + r.amount_cents, 0);
  const collected = rows.filter((r) => r.status === "paid").reduce((n, r) => n + r.amount_cents, 0);

  const sorted = [...rows].sort((a, b) => {
    if (a.status !== b.status) return a.status === "paid" ? 1 : -1;
    return b.days_past_due - a.days_past_due;
  });

  return (
    <>
      {demo ? (
        <p className="mb-10 border-l-2 border-due pl-4 text-[13px] leading-relaxed text-muted">
          No invoices on this device yet, so this is demo data.{" "}
          <Link href="/new" className="text-surface underline underline-offset-4">
            Create one
          </Link>{" "}
          and it will appear here instead.
        </p>
      ) : null}

      <div className="mb-14 grid gap-x-10 gap-y-8 sm:grid-cols-3">
        <Stat label="Outstanding" cents={outstanding} index={0} />
        <Stat
          label={`Overdue · ${overdue.length}`}
          cents={overdueTotal}
          tone={overdueTotal > 0 ? "text-overdue" : undefined}
          index={1}
        />
        <Stat label="Collected" cents={collected} tone="text-paid" index={2} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface/25">
              {["Invoice", "Client", "State", "Opened", "Amount"].map((h) => (
                <th
                  key={h}
                  className={`pb-3 text-[11px] font-normal tracking-[0.16em] text-muted uppercase ${
                    h === "Amount" ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const s = state(row);
              return (
                <tr
                  key={row.id}
                  className="enter border-b border-surface/10 align-baseline"
                  style={{ ["--i" as string]: i + 3 }}
                >
                  <td className="py-5 pr-6">
                    <Link href={`/invoice/${row.id}`} className="font-serif text-[19px] tracking-tight underline-offset-4 hover:underline">
                      {row.description}
                    </Link>
                  </td>
                  <td className="py-5 pr-6 text-[14px] text-surface/70">{row.client_name}</td>
                  <td className={`py-5 pr-6 text-[13px] ${s.tone}`}>
                    {s.text}
                    {row.register ? (
                      <span className="block text-[11px] tracking-[0.14em] text-muted uppercase">
                        {row.register}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-5 pr-6 text-[13px] whitespace-nowrap tabular-nums text-muted">
                    {row.views > 0 ? `${row.views}\u00d7` : "not yet"}
                  </td>
                  <td className="py-5 text-right font-serif text-[19px] tracking-tight tabular-nums">
                    {formatMoney(row.amount_cents, row.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!demo ? (
        <button
          type="button"
          onClick={() => {
            forgetAll();
            load(DEMO_IDS, true);
          }}
          className="mt-10 text-[12px] text-muted underline underline-offset-4"
        >
          Clear this device&apos;s history
        </button>
      ) : null}
    </>
  );
}
