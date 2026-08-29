export type Tone = "gentle" | "standard" | "relentless";
export type Status = "sent" | "paid";
export type Register = "cordial" | "firm" | "cold" | "final";

export type Invoice = {
  id: string;
  freelancer_name: string;
  client_name: string;
  client_email: string;
  description: string;
  amount_cents: number;
  currency: string;
  issued_at: Date;
  due_at: Date;
  tone: Tone;
  status: Status;
  paid_at: Date | null;
};

export function isTone(value: string): value is Tone {
  return value === "gentle" || value === "standard" || value === "relentless";
}
