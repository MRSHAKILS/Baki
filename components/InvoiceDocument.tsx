import Link from "next/link";
import { CopyLink } from "@/components/CopyLink";
import { LadderPreview } from "@/components/LadderPreview";
import { PromiseDate } from "@/components/PromiseDate";
import { OverdueClock } from "@/components/OverdueClock";
import { reminderCopy } from "@/lib/copy";
import { getEscalation, REGISTER_LABELS } from "@/lib/escalation";
import { formatDate, formatMoney } from "@/lib/format";
import { paymentHref } from "@/lib/payment";
import type { Invoice } from "@/lib/types";

type Props = {
  invoice: Invoice;
  shareUrl?: string;
};

export async function InvoiceDocument({ invoice, shareUrl }: Props) {
  const paid = invoice.status === "paid";
  const escalation = getEscalation(invoice.tone, invoice.due_at);
  const register = paid ? null : escalation.register;
  const liveCopy =
    register === null
      ? null
      : await reminderCopy({
          register,
          description: invoice.description,
          daysPastDue: escalation.daysPastDue,
        });

  const amountColor = paid
    ? "text-paid"
    : escalation.daysPastDue > 0
      ? "text-overdue"
      : "text-due";
  const ruleColor = paid ? "bg-paid" : escalation.daysPastDue > 0 ? "bg-overdue" : "bg-due";

  return (
    <article className="bg-surface px-8 py-10 text-ink sm:px-14 sm:py-16">
      <header style={{ ["--i" as string]: 0 }} className="enter flex items-baseline justify-between gap-4">
        <Link href="/" className="font-serif text-[28px] leading-none tracking-tight">
          Baki
        </Link>
        <p className="text-[13px] text-muted">{invoice.id}</p>
      </header>

      <div style={{ ["--i" as string]: 1 }} className="enter mt-8 h-px bg-ink" />

      <div style={{ ["--i" as string]: 2 }} className="enter mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">From</p>
          <p className="mt-2 text-[16px]">{invoice.freelancer_name}</p>
        </div>
        <div>
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Bill to</p>
          <p className="mt-2 text-[16px]">{invoice.client_name}</p>
          <p className="mt-1 text-[14px] text-muted">{invoice.client_email}</p>
        </div>
      </div>

      {shareUrl ? (
        <div style={{ ["--i" as string]: 3 }} className="enter mt-8">
          <CopyLink url={shareUrl} />
        </div>
      ) : null}

      <div style={{ ["--i" as string]: 4 }} className="enter mt-8 h-px bg-rule" />

      <p className="mt-8 max-w-xl text-[18px] leading-relaxed">{invoice.description}</p>

      <p className="mt-10 text-[12px] tracking-[0.16em] text-muted uppercase">Amount due</p>
      <p
        className={`font-serif text-[64px] leading-none tracking-tight sm:text-[80px] ${amountColor}`}
      >
        {formatMoney(invoice.amount_cents, invoice.currency)}
      </p>
      <div style={{ ["--i" as string]: 5 }} className={`mt-6 h-px w-24 ${ruleColor}`} />

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Issued</p>
          <p className="mt-2 text-[16px]">{formatDate(invoice.issued_at)}</p>
        </div>
        <div>
          <p className="text-[12px] tracking-[0.16em] text-muted uppercase">Due</p>
          <p className={`mt-2 text-[16px] ${paid ? "text-ink" : amountColor}`}>
            {formatDate(invoice.due_at)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {paid ? (
          <div className="border-y border-rule py-8">
            <p className="text-[12px] tracking-[0.18em] text-paid uppercase">Paid</p>
            <p className="mt-3 font-serif text-[28px] text-paid">
              {invoice.paid_at ? formatDate(invoice.paid_at) : "Settled"}
            </p>
          </div>
        ) : (
          <OverdueClock dueAt={invoice.due_at.toISOString()} paid={false} />
        )}
      </div>

      {!paid && register && liveCopy ? (
        <section className="mt-8">
          <p className="text-[12px] tracking-[0.18em] text-overdue uppercase">
            Current stage · {REGISTER_LABELS[register]}
          </p>
          <p className="mt-3 max-w-xl text-[18px] leading-relaxed">{liveCopy}</p>
        </section>
      ) : null}

      {!paid && !register ? (
        <section className="mt-8">
          <p className="text-[12px] tracking-[0.18em] text-due uppercase">
            {escalation.daysPastDue < 0 ? "Not yet due" : "Due"}
          </p>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted">
            {awaitingCopy(invoice.description, escalation.daysPastDue, invoice.tone)}
          </p>
        </section>
      ) : null}

      <div className="mt-10">
        {paid ? (
          <p className="border border-paid px-4 py-3 text-center text-[13px] tracking-[0.16em] text-paid uppercase">
            This invoice is paid
          </p>
        ) : (
          <a
            href={paymentHref(invoice.id)}
            className="block border border-ink bg-ink py-3.5 text-center text-[13px] tracking-[0.16em] text-surface uppercase"
          >
            Pay this invoice
          </a>
        )}
      </div>

      {!paid ? (
        <div className="mt-6 border-t border-rule pt-6">
          {invoice.promised_at ? (
            <p className="text-[13px] leading-relaxed text-muted">
              Payment promised for{" "}
              <span className="text-ink">{formatDate(new Date(invoice.promised_at))}</span>.
              Reminders are paused until then.
            </p>
          ) : (
            <PromiseDate id={invoice.id} />
          )}
        </div>
      ) : null}

      <div className="mt-12">
        <LadderPreview
          dueAt={invoice.due_at.toISOString()}
          description={invoice.description}
          tone={invoice.tone}
          paid={paid}
          defaultOpen={Boolean(register)}
        />
      </div>
    </article>
  );
}

function awaitingCopy(description: string, daysPastDue: number, tone: string): string {
  if (daysPastDue < 0) {
    return `Payment for ${description} is not due yet. The reminder ladder is scheduled against the due date.`;
  }
  if (tone === "gentle") {
    return `Payment for ${description} is overdue. The first reminder is on day 3.`;
  }
  return `Payment for ${description} is due.`;
}
