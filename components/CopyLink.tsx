"use client";

import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="border border-rule bg-surface-2 px-5 py-4 text-[14px] text-ink">
      <p className="text-[12px] tracking-[0.14em] text-muted uppercase">Shareable link</p>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
        <p className="break-all">{url}</p>
        <button type="button" onClick={copy} className="shrink-0 text-muted underline-offset-4 hover:text-ink">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
