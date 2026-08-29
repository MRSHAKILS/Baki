"use client";

import { useMemo, useState } from "react";
import { createInvoice } from "@/app/actions";
import { LadderPreview } from "@/components/LadderPreview";
import { TONE_LABELS, TONE_SCHEDULE } from "@/lib/escalation";
import { toDateInput } from "@/lib/format";
import type { Tone } from "@/lib/types";

const TONES: Tone[] = ["gentle", "standard", "relentless"];

function defaultDue(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 7);
  return toDateInput(date);
}

export function CreateInvoiceForm() {
  const [tone, setTone] = useState<Tone>("standard");
  const [dueAt, setDueAt] = useState(defaultDue);
  const [description, setDescription] = useState("");
  const dueDate = useMemo(() => {
    const parsed = new Date(`${dueAt}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [dueAt]);

  return (
    <form action={createInvoice} className="text-ink">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="From" name="freelancer_name" placeholder="Your name" />
        <div className="grid gap-8">
          <Field label="Bill to" name="client_name" placeholder="Client name" />
          <Field
            label="Client email"
            name="client_email"
            type="email"
            placeholder="client@studio.com"
          />
        </div>
      </div>

      <div className="mt-8 border-t border-rule pt-8">
        <label className="block">
          <span className="text-[12px] tracking-[0.16em] text-muted uppercase">For</span>
          <textarea
            name="description"
            required
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What the work was"
            className="mt-2 w-full resize-none border-0 border-b border-rule bg-transparent pb-2 text-[16px] text-ink outline-none placeholder:text-muted"
          />
        </label>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12px] tracking-[0.16em] text-muted uppercase">Amount, USD</span>
          <input
            name="amount"
            required
            inputMode="decimal"
            placeholder="0.00"
            className="mt-2 w-full border-0 border-b border-rule bg-transparent pb-2 font-serif text-[40px] leading-none text-ink outline-none placeholder:text-muted"
          />
        </label>
        <label className="block">
          <span className="text-[12px] tracking-[0.16em] text-muted uppercase">Due</span>
          <input
            name="due_at"
            type="date"
            required
            value={dueAt}
            onChange={(event) => setDueAt(event.target.value)}
            className="mt-2 w-full border-0 border-b border-rule bg-transparent pb-3 text-[16px] text-ink outline-none"
          />
        </label>
      </div>

      <fieldset className="mt-10">
        <legend className="text-[12px] tracking-[0.16em] text-muted uppercase">Tone</legend>
        <div className="mt-4 grid gap-3">
          {TONES.map((option) => (
            <label key={option} className="flex cursor-pointer items-baseline gap-3">
              <input
                type="radio"
                name="tone"
                value={option}
                checked={tone === option}
                onChange={() => setTone(option)}
                className="mt-1 accent-[#1E1913]"
              />
              <span>
                <span className="text-ink">{TONE_LABELS[option]}</span>
                <span className="ml-3 text-[13px] text-muted">
                  Day {TONE_SCHEDULE[option].join(", day ")}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10">
        <LadderPreview
          dueAt={dueDate}
          description={description || "the work"}
          tone={tone}
          defaultOpen
          onToneChange={setTone}
        />
      </div>

      <button
        type="submit"
        className="mt-10 w-full border border-ink bg-ink py-3.5 text-[13px] tracking-[0.16em] text-surface uppercase"
      >
        Create invoice link
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[12px] tracking-[0.16em] text-muted uppercase">{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="mt-2 w-full border-0 border-b border-rule bg-transparent pb-2 text-[16px] text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}
