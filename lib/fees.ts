/**
 * What actually lands in a Bangladeshi freelancer's hands.
 *
 * Bangladesh Bank has only recently cleared a bank-intermediated framework for
 * PayPal/Payoneer-style services, and Payoneer still does not let users hold a
 * balance in Bangladesh. In practice the money arrives via Payoneer and is
 * withdrawn through a local partner such as upay.
 *
 * These are published headline rates, not a quote. The invoice always shows the
 * client the gross amount — this estimate is for the freelancer only.
 */
export const FEE_MODEL = {
  receivingPct: 2.0, // Payoneer receiving, typical card/marketplace rate
  withdrawalPct: 1.0, // upay withdrawal, per the Payoneer-upay partnership
} as const;

export const FEE_TOTAL_PCT = FEE_MODEL.receivingPct + FEE_MODEL.withdrawalPct;

export function estimateNetCents(grossCents: number): number {
  if (grossCents <= 0) return 0;
  return Math.round(grossCents * (1 - FEE_TOTAL_PCT / 100));
}

export function estimateFeeCents(grossCents: number): number {
  return Math.max(0, grossCents - estimateNetCents(grossCents));
}
