import { confirmPayment } from "@/app/actions";
import { formatDate, formatMoney } from "@/lib/format";
import { getInvoice } from "@/lib/invoices";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();
  if (invoice.status === "paid") redirect(`/invoice/${invoice.id}`);

  return (
    <main className="mx-auto w-full max-w-[560px] px-4 py-10 sm:py-20">
      <p className="border border-due bg-surface px-4 py-3 text-center text-[13px] tracking-[0.12em] text-ink uppercase">
        Test mode - no live payment
      </p>

      <section className="mt-6 bg-surface px-8 py-10 text-ink sm:px-12 sm:py-12">
        <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Checkout</p>
        <h1 className="mt-3 font-serif text-[32px] tracking-tight">Pay {invoice.freelancer_name}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{invoice.description}</p>

        <div className="my-8 h-px bg-rule" />

        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[13px] text-muted">Amount due</span>
          <span className="font-serif text-[36px] leading-none tracking-tight">
            {formatMoney(invoice.amount_cents, invoice.currency)}
          </span>
        </div>
        <p className="mt-3 text-right text-[13px] text-muted">Due {formatDate(invoice.due_at)}</p>

        <form action={confirmPayment} className="mt-10">
          <input type="hidden" name="id" value={invoice.id} />
          <button
            type="submit"
            className="w-full border border-ink bg-ink py-3.5 text-[13px] tracking-[0.16em] text-surface uppercase"
          >
            Confirm payment
          </button>
        </form>

        <p className="mt-6 text-[13px] leading-relaxed text-muted">
          This page follows the shape of a hosted checkout. Confirming marks the invoice paid. No
          card is charged.
        </p>

        <p className="mt-8 text-[13px]">
          <Link href={`/invoice/${invoice.id}`} className="text-muted">
            Return to invoice
          </Link>
        </p>
      </section>
    </main>
  );
}
