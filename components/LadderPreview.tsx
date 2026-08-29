"use client";

import { useMemo, useState } from "react";
import {
  REGISTER_LABELS,
  TONE_LABELS,
  TONE_SCHEDULE,
  buildStages,
  calendarDaysPastDue,
  currentStageIndex,
  type LadderStage,
} from "@/lib/escalation";
import { templateCopy } from "@/lib/copy";
import { formatDateShort } from "@/lib/format";
import type { Register, Tone } from "@/lib/types";

const TONES: Tone[] = ["gentle", "standard", "relentless"];

type Props = {
  dueAt: Date | string;
  description: string;
  tone: Tone;
  selectable?: boolean;
  defaultOpen?: boolean;
  paid?: boolean;
  onToneChange?: (tone: Tone) => void;
};

function asDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export function LadderPreview({
  dueAt,
  description,
  tone: invoiceTone,
  selectable = true,
  defaultOpen = false,
  paid = false,
  onToneChange,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [previewTone, setPreviewTone] = useState<Tone | null>(null);
  const tone = onToneChange ? invoiceTone : selectable ? (previewTone ?? invoiceTone) : invoiceTone;
  const due = asDate(dueAt);
  const now = useMemo(() => new Date(), []);
  const daysPastDue = calendarDaysPastDue(due, now);
  const stages = buildStages(tone, due);
  const activeIndex = paid ? null : currentStageIndex(daysPastDue, tone);

  return (
    <section className="border-t border-rule pt-8">
      <div className="flex items-baseline justify-between gap-4">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-left text-[13px] tracking-[0.14em] text-muted uppercase"
          aria-expanded={open}
        >
          Preview the ladder
        </button>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="text-[13px] text-muted"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open ? (
        <div className="mt-6">
          {selectable ? (
            <div className="mb-8">
              <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Tone</p>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {TONES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      if (onToneChange) onToneChange(option);
                      else setPreviewTone(option);
                    }}
                    className={`text-[13px] tracking-[0.08em] uppercase ${
                      option === tone ? "text-ink" : "text-muted"
                    }`}
                  >
                    {TONE_LABELS[option]}
                    <span className="ml-2 font-normal normal-case tracking-normal text-muted">
                      day {TONE_SCHEDULE[option].join(", ")}
                    </span>
                  </button>
                ))}
              </div>
              {tone !== invoiceTone ? (
                <p className="mt-3 text-[13px] text-muted">
                  Previewing {TONE_LABELS[tone]}. This invoice is set to{" "}
                  {TONE_LABELS[invoiceTone]}.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mb-8 text-[13px] text-muted">
              {TONE_LABELS[tone]} · day {TONE_SCHEDULE[tone].join(", ")}
            </p>
          )}

          <ol>
            {stages.map((stage, index) => (
              <StageRow
                key={`${tone}-${stage.day}`}
                stage={stage}
                description={description}
                active={activeIndex === index}
                daysForCopy={stage.day}
              />
            ))}
          </ol>

          {activeIndex === null && !paid ? (
            <p className="mt-6 text-[13px] text-muted">
              {daysPastDue < 0
                ? "No notice yet. The ladder starts on the due date, or later if the tone is gentle."
                : "No notice yet. Gentle waits until three days after the due date."}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function StageRow({
  stage,
  description,
  active,
  daysForCopy,
}: {
  stage: LadderStage;
  description: string;
  active: boolean;
  daysForCopy: number;
}) {
  const copy = templateCopy({
    register: stage.register,
    description,
    daysPastDue: daysForCopy,
  });
  const color = registerColor(stage.register, active);

  return (
    <li
      className={`border-t border-rule py-4 first:border-t-0 ${active ? "" : "opacity-70"}`}
    >
      <div className="grid gap-1 sm:grid-cols-[4.25rem_6.75rem_5.25rem_1fr] sm:gap-4 sm:items-baseline">
        <span className="text-[13px] text-muted">Day {stage.day}</span>
        <span className="text-[14px] text-muted">{formatDateShort(stage.at)}</span>
        <span className="text-[12px] tracking-[0.12em] uppercase" style={{ color }}>
          {REGISTER_LABELS[stage.register]}
        </span>
        <span className="text-[14px] leading-snug text-ink">
          {active ? <span className="mr-2 text-muted">Now</span> : null}
          {copy}
        </span>
      </div>
    </li>
  );
}

function registerColor(register: Register, active: boolean): string {
  if (!active) return "var(--muted)";
  if (register === "cordial") return "var(--due)";
  return "var(--overdue)";
}
