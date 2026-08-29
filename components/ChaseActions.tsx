"use client";

import { useState } from "react";

/**
 * Baki writes the reminder. You send it from wherever you already talk to the
 * client — which for most freelancers here is WhatsApp, not SMTP.
 */
export function ChasePanel({
  message,
  clientName,
  description,
  onClose,
}: {
  message: string;
  clientName: string;
  description: string;
  onClose: () => void;
}) {
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

  return (
    <div className="enter flex flex-wrap items-start justify-between gap-x-10 gap-y-5 pb-6">
      <div className="max-w-xl border-l-2 border-overdue pl-4">
        <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Ready to send</p>
        {full.split("\n\n").map((para, i) => (
          <p key={i} className="mt-2 text-[14px] leading-relaxed text-surface/85">
            {para}
          </p>
        ))}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2">
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
          onClick={onClose}
          className="text-[12px] text-muted underline underline-offset-4"
        >
          Close
        </button>
      </div>
    </div>
  );
}
