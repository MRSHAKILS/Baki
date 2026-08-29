"use client";

import { useEffect } from "react";
import { rememberInvoice } from "@/lib/history";

/** Records a freshly created invoice into this browser's local history. */
export function RememberInvoice({ id }: { id: string }) {
  useEffect(() => {
    rememberInvoice(id);
  }, [id]);
  return null;
}
