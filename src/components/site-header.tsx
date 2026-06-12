import type { ReactNode } from "react";
import Link from "next/link";

type SiteHeaderProps = {
  brandName: string;
  navItems: Array<{ href: string; label: string }>;
  primaryHref: string;
  secondaryHref?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  primarySlot?: ReactNode;
};

export function SiteHeader({
  brandName,
  navItems,
  primaryHref,
  secondaryHref,
  primaryLabel = "Apply",
  secondaryLabel = "Member Login",
  primarySlot,
}: SiteHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-[rgba(245,239,230,0.8)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:gap-6 sm:px-6 sm:py-4 lg:px-8">
        <Link
          href="#top"
          className="type-display shrink-0 text-[1.45rem] leading-none uppercase text-[var(--ink)] sm:text-2xl"
        >
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

        <div className="flex items-center gap-2 sm:gap-3">
          {secondaryHref ? (
            <Link
              href={secondaryHref}
              className="hidden text-xs uppercase tracking-[0.16em] text-[var(--muted)] transition hover:text-[var(--ink)] md:inline-flex md:text-sm"
            >
              {secondaryLabel}
            </Link>
          ) : null}

          {primarySlot || (
            <Link href={primaryHref} className="btn-header">
              {primaryLabel}
            </Link>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--line)] md:hidden">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-1.5 sm:px-6">
          <nav className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {secondaryHref ? (
            <Link
              href={secondaryHref}
              className="shrink-0 rounded-full border border-[var(--line)] bg-white/45 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--ink)] transition hover:bg-white/75"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
