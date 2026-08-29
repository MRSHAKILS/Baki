import { InvoiceDocument } from "@/components/InvoiceDocument";
import { getInvoice, recordInvoiceView } from "@/lib/invoices";
import { RememberInvoice } from "@/components/RememberInvoice";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const invoice = await getInvoice(id);
  if (!invoice) notFound();

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const isOwnerPreview = query.new === "1";
  const shareUrl = isOwnerPreview && host ? `${protocol}://${host}/invoice/${invoice.id}` : undefined;

  // Count client opens only. The freelancer's own post-creation preview is not a view.
  if (!isOwnerPreview) await recordInvoiceView(invoice.id);

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-10 sm:py-20">
      {isOwnerPreview ? <RememberInvoice id={invoice.id} /> : null}
      <InvoiceDocument invoice={invoice} shareUrl={shareUrl} />
    </main>
  );
}
