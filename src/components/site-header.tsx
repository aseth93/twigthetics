import Link from "next/link";

type SiteHeaderProps = {
  brandName: string;
  navItems: Array<{ href: string; label: string }>;
  primaryHref: string;
  secondaryHref?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
};

export function SiteHeader({
  brandName,
  navItems,
  primaryHref,
  secondaryHref,
  primaryLabel = "Apply",
  secondaryLabel = "Member Login",
}: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[rgba(245,239,230,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="#top" className="type-display text-2xl uppercase text-[var(--ink)]">
          {brandName}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm uppercase tracking-[0.16em] text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {secondaryHref ? (
            <Link
              href={secondaryHref}
              className="hidden text-sm uppercase tracking-[0.16em] text-[var(--muted)] transition hover:text-[var(--ink)] md:inline-flex"
            >
              {secondaryLabel}
            </Link>
          ) : null}

          <Link href={primaryHref} className="btn-header">
            {primaryLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
