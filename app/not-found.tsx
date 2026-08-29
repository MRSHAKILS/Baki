import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[560px] px-6 py-24">
      <p className="font-serif text-[32px] tracking-tight">Baki</p>
      <p className="mt-6 text-[16px] text-surface/80">This invoice was not found.</p>
      <p className="mt-8 text-[14px]">
        <Link href="/" className="text-muted">
          Create an invoice
        </Link>
      </p>
    </main>
  );
}
