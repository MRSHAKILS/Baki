import { exampleInvoices, seedExamples } from "@/lib/invoices";
import { formatMoney } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await seedExamples();
  const examples = exampleInvoices();

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-14 sm:px-10 sm:py-20">
      <header className="enter mb-14" style={{ ["--i" as string]: 0 }}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div className="flex items-baseline gap-3">
            <p className="font-serif text-[34px] leading-none tracking-tight">Baki</p>
            <p className="text-[12px] text-muted">বাকি · outstanding, still owed</p>
          </div>
          <p className="shrink-0 text-[12px] text-muted">$9/month</p>
        </div>

        <h1 className="mt-10 max-w-[15ch] font-serif text-[44px] leading-[1.05] tracking-tight sm:text-[56px]">
          Send an invoice link.
        </h1>
        <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-surface/75">
          Baki chases the client so you don&apos;t have to.
        </p>

        <div className="mt-10 border-t border-surface/15 pt-5">
          <p className="text-[12px] tracking-[0.14em]">
            <span className="text-due">CORDIAL</span>
            <span className="text-muted"> → </span>
            <span className="text-due">FIRM</span>
            <span className="text-muted"> → </span>
            <span className="text-overdue">COLD</span>
            <span className="text-muted"> → </span>
            <span className="text-overdue">FINAL</span>
            <span className="text-muted"> · on a schedule you choose</span>
          </p>
        </div>
      </header>

      <div className="enter mb-16 flex flex-wrap items-center gap-4" style={{ ["--i" as string]: 2 }}>
        <Link
          href="/new"
          className="bg-surface px-7 py-3 text-[13px] tracking-[0.1em] text-ink uppercase"
        >
          Create an invoice
        </Link>
        <Link
          href="/dashboard"
          className="px-1 py-3 text-[13px] tracking-[0.04em] text-muted underline underline-offset-[6px] hover:text-surface"
        >
          See the overview
        </Link>
      </div>


      <section
        className="enter mb-16 border-t border-surface/15 pt-8"
        style={{ ["--i" as string]: 3 }}
      >
        <dl className="grid gap-x-12 gap-y-7 sm:grid-cols-2">
          {[
            [
              "It writes the follow-up",
              "At every stage Baki has the wording ready. Copy it, or open it in WhatsApp or email.",
            ],
            [
              "The client can answer back",
              "They can commit to a date instead of paying today. The ladder pauses until it passes, then resumes colder.",
            ],
            [
              "You can see if they opened it",
              "Every invoice counts client opens, so you know the difference between unseen and ignored.",
            ],
            [
              "And what actually reaches you",
              "Outstanding totals carry an estimate of what survives Payoneer and upay fees.",
            ],
          ].map(([term, detail]) => (
            <div key={term}>
              <dt className="font-serif text-[19px] leading-snug tracking-tight">{term}</dt>
              <dd className="mt-2 text-[14px] leading-relaxed text-muted">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="enter" style={{ ["--i" as string]: 4 }}>
        <h2 className="text-[12px] tracking-[0.18em] text-muted uppercase">Examples</h2>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-surface/70">
          Three invoices to open as a client would. No form required.
        </p>
        <ul className="mt-8 border-t border-surface/15">
          {examples.map((invoice) => (
            <li key={invoice.id} className="border-b border-surface/15 py-5">
              <Link href={`/invoice/${invoice.id}`} className="block">
                <p className="text-[12px] tracking-[0.04em] text-muted">{invoice.label}</p>
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

    </main>
  );
}
