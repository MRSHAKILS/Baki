"use client";

import { useState } from "react";

/**
 * Baki writes the reminder. You send it from wherever you already talk to the
 * client — which for most freelancers is WhatsApp, not SMTP.
 */
export function ChaseActions({
  message,
  clientName,
  description,
}: {
  message: string;
  clientName: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const full = `Hello ${clientName},\n\n${message}\n\nThank you.`;
  const wa = `https://wa.me/?text=${encodeURIComponent(full)}`;
  const mail = `mailto:?subject=${encodeURIComponent(
    `Invoice: ${description}`,
  )}&body=${encodeURIComponent(full)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[12px] tracking-[0.04em] text-muted underline underline-offset-4 hover:text-surface"
      >
        Chase
      </button>
    );
  }

  return (
    <div className="enter max-w-sm">
      <p className="border-l-2 border-overdue pl-3 text-[13px] leading-relaxed text-surface/80">
        {full.split("\n\n").map((para, i) => (
          <span key={i} className="block first:mt-0 [&:not(:first-child)]:mt-2">
            {para}
          </span>
        ))}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={copy}
          className="text-[12px] tracking-[0.04em] text-surface underline underline-offset-4"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] tracking-[0.04em] text-muted underline underline-offset-4 hover:text-surface"
        >
          WhatsApp
        </a>
        <a
          href={mail}
          className="text-[12px] tracking-[0.04em] text-muted underline underline-offset-4 hover:text-surface"
        >
          Email
        </a>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[12px] text-muted underline underline-offset-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}
