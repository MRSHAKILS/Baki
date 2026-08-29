"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/format";

/** Counts a money figure up on mount. Settles on the exact value. */
export function CountUp({
  cents,
  currency = "USD",
  duration = 900,
}: {
  cents: number;
  currency?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(cents);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || cents === 0) {
      setValue(cents);
      return;
    }

    const start = performance.now();
    setValue(0);

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(cents * eased));
      if (t < 1) frame.current = requestAnimationFrame(step);
    };

    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [cents, duration]);

  return <>{formatMoney(value, currency)}</>;
}
