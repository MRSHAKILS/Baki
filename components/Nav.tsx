import Link from "next/link";

export function Nav({ current }: { current?: "overview" | "new" }) {
  const link = (href: string, label: string, key: "overview" | "new") => (
    <Link
      href={href}
      className={`text-[13px] tracking-[0.04em] underline-offset-[6px] ${
        current === key ? "text-surface underline" : "text-muted hover:text-surface"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="mb-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-surface/15 pb-5">
      <Link href="/" className="flex items-baseline gap-3">
        <span className="font-serif text-[22px] leading-none tracking-tight">Baki</span>
        <span className="text-[11px] text-muted">বাকি · outstanding, still owed</span>
      </Link>
      <nav className="flex items-baseline gap-6">
        {link("/dashboard", "Overview", "overview")}
        {link("/new", "New invoice", "new")}
      </nav>
    </div>
  );
}
