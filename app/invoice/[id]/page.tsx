import { InvoiceDocument } from "@/components/InvoiceDocument";
import { getInvoice } from "@/lib/invoices";
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
  const shareUrl =
    query.new === "1" && host ? `${protocol}://${host}/invoice/${invoice.id}` : undefined;

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-10 sm:py-20">
      <InvoiceDocument invoice={invoice} shareUrl={shareUrl} />
    </main>
  );
}
