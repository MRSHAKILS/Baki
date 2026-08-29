import { Dashboard } from "@/components/Dashboard";
import { Nav } from "@/components/Nav";

export const metadata = { title: "Overview · Baki" };

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-14 sm:px-10 sm:py-16">
      <Nav current="overview" />

      <header className="mb-12">
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-tight sm:text-[48px]">
          Overview
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-surface/70">
          What you are owed, what is late, and whether the client has opened it.
        </p>

        <div className="mt-8 max-w-xl border-l-2 border-surface/20 pl-5">
          <p className="font-serif text-[19px] leading-snug tracking-tight">
            More than 70% of freelance invoices are paid late at least sometimes.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Almost none of that is refusal. It is drift — an invoice nobody opened, a follow-up
            nobody wanted to write. The figure that matters is not what you billed. It is what
            is late, whether they have seen it, and how long you have gone without saying
            anything.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Baki keeps that visible and writes the next message for you. Remembered in this
            browser only.
          </p>
        </div>
      </header>

      <Dashboard />
    </main>
  );
}
