/**
 * One-line swap: replace this return with a Stripe Payment Link URL
 * when live charges are available. Bangladesh cannot create Stripe accounts,
 * so checkout is simulated at /invoice/[id]/pay.
 */
export function paymentHref(invoiceId: string): string {
  return `/invoice/${invoiceId}/pay`;
}
