"use client";

import { useEffect, useState } from "react";
import { startOfUtcDay } from "@/lib/escalation";

type Props = {
  dueAt: string;
  paid: boolean;
};

type ClockState = {
  kind: "upcoming" | "today" | "overdue";
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function split(ms: number) {
  const safe = Math.max(0, ms);
  const days = Math.floor(safe / 86_400_000);
  const hours = Math.floor((safe % 86_400_000) / 3_600_000);
  const minutes = Math.floor((safe % 3_600_000) / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

function readClock(dueAt: Date, now: Date): ClockState {
  const dueDay = startOfUtcDay(dueAt);
  const today = startOfUtcDay(now);
  const days = Math.round((today.getTime() - dueDay.getTime()) / 86_400_000);

  if (days < 0) {
    return { kind: "upcoming", ...split(dueAt.getTime() - now.getTime()) };
  }
  if (days === 0) {
    const remaining = dueAt.getTime() + 86_400_000 - now.getTime();
    return { kind: "today", ...split(Math.max(0, remaining)) };
  }
  return { kind: "overdue", ...split(now.getTime() - dueAt.getTime()) };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function OverdueClock({ dueAt, paid }: Props) {
  const due = new Date(dueAt);
  const [clock, setClock] = useState<ClockState>(() => readClock(due, new Date()));

  useEffect(() => {
    if (paid) return;
    const tick = () => setClock(readClock(due, new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueAt, paid]);

  if (paid) return null;

  const label =
    clock.kind === "overdue" ? "Overdue" : clock.kind === "today" ? "Due today" : "Due in";
  const color =
    clock.kind === "overdue"
      ? "text-overdue"
      : clock.kind === "today"
        ? "text-due"
        : "text-due";

  return (
    <div className="border-y border-rule py-8">
      <p
        className={`text-[12px] tracking-[0.18em] uppercase ${color} ${
          clock.kind === "overdue" ? "breathe" : ""
        }`}
      >
        {label}
      </p>
      <div className={`mt-4 flex flex-wrap gap-8 font-serif text-[28px] leading-none sm:text-[34px] ${color}`}>
        <Unit value={clock.days} label="days" />
        <Unit value={pad(clock.hours)} label="hours" />
        <Unit value={pad(clock.minutes)} label="minutes" />
        <Unit value={pad(clock.seconds)} label="seconds" />
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div>{value}</div>
      <div className="mt-2 font-sans text-[11px] tracking-[0.16em] text-muted uppercase">
        {label}
      </div>
    </div>
  );
}
