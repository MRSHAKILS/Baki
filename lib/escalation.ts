import type { Register, Tone } from "./types";

export const TONE_SCHEDULE: Record<Tone, readonly number[]> = {
  gentle: [3, 10, 21],
  standard: [0, 3, 7, 14],
  relentless: [0, 1, 3, 5, 8],
};

export const TONE_LABELS: Record<Tone, string> = {
  gentle: "Gentle",
  standard: "Standard",
  relentless: "Relentless",
};

export const REGISTER_LABELS: Record<Register, string> = {
  cordial: "Cordial",
  firm: "Firm",
  cold: "Cold",
  final: "Final",
};

const REGISTERS: readonly Register[] = ["cordial", "firm", "cold", "final"];

export type LadderStage = {
  day: number;
  register: Register;
  at: Date;
};

export type Escalation = {
  daysPastDue: number;
  stageIndex: number | null;
  register: Register | null;
  stages: LadderStage[];
};

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addUtcDays(date: Date, days: number): Date {
  const start = startOfUtcDay(date);
  start.setUTCDate(start.getUTCDate() + days);
  return start;
}

export function calendarDaysPastDue(dueAt: Date, now = new Date()): number {
  const due = startOfUtcDay(dueAt).getTime();
  const today = startOfUtcDay(now).getTime();
  return Math.round((today - due) / 86_400_000);
}

export function registerForStage(tone: Tone, stageIndex: number): Register {
  const startsOnDueDate = TONE_SCHEDULE[tone][0] === 0;
  const registerIndex = startsOnDueDate ? stageIndex : stageIndex + 1;
  return REGISTERS[Math.min(registerIndex, REGISTERS.length - 1)];
}

export function buildStages(tone: Tone, dueAt: Date): LadderStage[] {
  return TONE_SCHEDULE[tone].map((day, index) => ({
    day,
    register: registerForStage(tone, index),
    at: addUtcDays(dueAt, day),
  }));
}

export function currentStageIndex(daysPastDue: number, tone: Tone): number | null {
  const schedule = TONE_SCHEDULE[tone];
  if (daysPastDue < schedule[0]) return null;
  let index = 0;
  for (let i = 0; i < schedule.length; i++) {
    if (daysPastDue >= schedule[i]) index = i;
  }
  return index;
}

export function getEscalation(tone: Tone, dueAt: Date, now = new Date()): Escalation {
  const daysPastDue = calendarDaysPastDue(dueAt, now);
  const stageIndex = currentStageIndex(daysPastDue, tone);
  return {
    daysPastDue,
    stageIndex,
    register: stageIndex === null ? null : registerForStage(tone, stageIndex),
    stages: buildStages(tone, dueAt),
  };
}
