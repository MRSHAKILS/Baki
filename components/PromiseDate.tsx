"use client";

import { useState } from "react";
import { promiseDate } from "@/app/actions";
import { toDateInput } from "@/lib/format";

function defaultPromise(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  return toDateInput(d);
}

/**
 * The client's side of the negotiation. Committing to a date pauses the ladder
 * until that date — which is worth more to them than ignoring it.
 */
export function PromiseDate({ id }: { id: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[13px] text-muted underline underline-offset-4 hover:text-ink"
      >
        I will pay by a date
      </button>
    );
  }

  return (
    <form action={promiseDate} className="enter">
      <input type="hidden" name="id" value={id} />
      <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Commit to a date</p>
      <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
        Reminders stop until then. If the date passes without payment, they resume more
        firmly.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="date"
          name="promised_at"
          defaultValue={defaultPromise()}
          className="border border-rule px-3 py-2 text-[14px] text-ink"
        />
        <button type="submit" className="bg-ink px-5 py-2 text-[12px] tracking-[0.1em] text-surface uppercase">
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[12px] text-muted underline underline-offset-4"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
