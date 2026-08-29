import type { Register } from "./types";

type CopyArgs = {
  register: Register;
  description: string;
  daysPastDue: number;
};

function sentenceCase(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function templateCopy({ register, description, daysPastDue }: CopyArgs): string {
  const n = Math.max(0, daysPastDue);
  const days = n === 1 ? "1 day" : `${n} days`;
  switch (register) {
    case "cordial":
      return `A quick note: payment for ${description} is due today.`;
    case "firm":
      return `Following up on ${description}, now ${days} past due.`;
    case "cold":
      return `${sentenceCase(description)} is ${days} overdue. Please confirm a payment date.`;
    case "final":
      return `Final notice. ${sentenceCase(description)} remains unpaid ${days} after the due date.`;
  }
}

async function modelCopy(args: CopyArgs, apiKey: string): Promise<string | null> {
  const template = templateCopy(args);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 800);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.4,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content:
              "Write one invoice reminder sentence. No exclamation marks. No emoji. Stay in the named register. Return only the sentence.",
          },
          {
            role: "user",
            content: `Register: ${args.register}. Description: ${args.description}. Days past due: ${args.daysPastDue}. Keep the meaning of: ${template}`,
          },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text || text.includes("!") || text.length > 280) return null;
    return text.replace(/^["']|["']$/g, "");
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function reminderCopy(args: CopyArgs): Promise<string> {
  const fallback = templateCopy(args);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fallback;

  try {
    return (await modelCopy(args, apiKey)) ?? fallback;
  } catch {
    return fallback;
  }
}
