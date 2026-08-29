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
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-surface/70">
          What you are owed, what is late, and whether the client has opened it. Remembered in
          this browser only.
        </p>
      </header>

      <Dashboard />
    </main>
  );
}
