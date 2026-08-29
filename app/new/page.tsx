import { CreateInvoiceForm } from "@/components/CreateInvoiceForm";
import { Nav } from "@/components/Nav";

export const dynamic = "force-dynamic";

export const metadata = { title: "New invoice · Baki" };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto w-full max-w-[760px] px-6 py-14 sm:px-10 sm:py-16">
      <Nav current="new" />

      <header className="mb-10">
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-tight sm:text-[48px]">
          New invoice
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-surface/70">
          Your client opens one URL. There is no account for them to create, and no PDF to
          download.
        </p>
      </header>

      <section className="bg-surface px-6 py-10 text-ink sm:px-12 sm:py-14">
        {params.error ? (
          <p className="mb-6 text-[14px] text-overdue">
            Check the fields and try again. Amount must be a number greater than zero.
          </p>
        ) : null}
        <CreateInvoiceForm />
      </section>
    </main>
  );
}
