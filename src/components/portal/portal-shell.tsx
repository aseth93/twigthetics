import Link from "next/link";
import { formatRoleLabel } from "@/lib/portal/format";
import type { PortalViewer } from "@/types/portal";
import { LogoutButton } from "./logout-button";

type PortalShellProps = {
  viewer: PortalViewer;
  title: string;
  subtitle: string;
  navItems: Array<{ href: string; label: string }>;
  children: React.ReactNode;
};

export function PortalShell({
  viewer,
  title,
  subtitle,
  navItems,
  children,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf7f2_0%,var(--canvas)_56%,#efe1cf_100%)]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-6 px-5 py-5 lg:grid-cols-[18rem_1fr] lg:px-8">
        <aside className="surface-panel h-fit overflow-hidden lg:sticky lg:top-5">
          <div className="border-b border-[var(--line)] px-5 py-5">
            <Link href="/" className="type-display text-2xl uppercase text-[var(--ink)]">
              Twigthetics
            </Link>
            <p className="mt-4 text-sm font-medium text-[var(--ink)]">{viewer.profile.fullName}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{viewer.profile.email}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              {formatRoleLabel(viewer.profile.role)}
            </p>
          </div>

          <nav className="grid grid-cols-1 gap-2 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1rem] px-4 py-3 text-sm font-medium text-[var(--muted)] transition hover:bg-white/70 hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-[var(--line)] px-4 py-4">
            <LogoutButton />
          </div>
        </aside>

        <div className="space-y-6">
          <section className="surface-panel overflow-hidden">
            <div className="bg-[linear-gradient(135deg,rgba(141,107,61,0.14),rgba(39,49,39,0.08))] px-6 py-7 md:px-8">
              <p className="eyebrow">Portal</p>
              <h1 className="display-title mt-4 text-[var(--ink)]">{title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--muted)]">
                {subtitle}
              </p>
            </div>
          </section>

          {children}
        </div>
      </div>
    </div>
  );
}
