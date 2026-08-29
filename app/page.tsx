import { CreateInvoiceForm } from "@/components/CreateInvoiceForm";
import { exampleInvoices, seedExamples } from "@/lib/invoices";
import { formatMoney } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await seedExamples();
  const params = await searchParams;
  const examples = exampleInvoices();

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-14 sm:px-10 sm:py-20">
      <header className="mb-12 flex items-baseline justify-between gap-6">
        <div>
          <p className="font-serif text-[40px] leading-none tracking-tight">Baki</p>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-surface/80">
            Outstanding, still owed. Fill the form and send the public link. After the due date,
            the invoice escalates in the tone you chose.
          </p>
        </div>
        <p className="shrink-0 text-[13px] text-muted">$9/month</p>
      </header>

      <section>
        <h2 className="text-[12px] tracking-[0.18em] text-muted uppercase">Examples</h2>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-surface/70">
          Three invoices to open as a client would. No form required.
        </p>
        <ul className="mt-8 border-t border-surface/15">
          {examples.map((invoice) => (
            <li key={invoice.id} className="border-b border-surface/15 py-5">
              <Link href={`/invoice/${invoice.id}`} className="block">
                <p className="text-[12px] tracking-[0.14em] text-muted uppercase">
                  Example · {invoice.label}
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <p className="font-serif text-[22px] leading-snug tracking-tight">
                    {invoice.description}
                  </p>
                  <p className="shrink-0 font-serif text-[20px] tracking-tight">
                    {formatMoney(invoice.amount_cents)}
                  </p>
                </div>
                <p className="mt-2 text-[14px] text-surface/70">
                  {invoice.freelancer_name} to {invoice.client_name} · {invoice.tone}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 bg-surface px-8 py-10 text-ink sm:px-12 sm:py-14">
        <h1 className="font-serif text-[26px] tracking-tight">New invoice</h1>
        <p className="mt-2 text-[14px] text-muted">
          The client opens one URL. There is no account to create.
        </p>
        {params.error ? (
          <p className="mt-4 text-[14px] text-overdue">
            Check the fields and try again. Amount must be a number greater than zero.
          </p>
        ) : null}
        <div className="mt-8">
          <CreateInvoiceForm />
        </div>
      </section>
    </main>
  );
}
