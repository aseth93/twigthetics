"use client";

import { useEffect, useState } from "react";
import { GuideCheckoutLink } from "@/components/guide-checkout-link";

export function GuideCheckoutRecovery() {
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    setCancelled(
      new URLSearchParams(window.location.search).get("checkout") === "cancelled",
    );
  }, []);

  if (!cancelled) {
    return null;
  }

  return (
    <section className="section-shell pb-0 pt-5" aria-live="polite">
      <div className="flex flex-col gap-4 rounded-[1.4rem] border border-[rgba(141,107,61,0.28)] bg-[rgba(255,250,243,0.92)] p-5 shadow-[0_16px_45px_rgba(37,24,10,0.1)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[var(--ink)]">Your checkout was not completed.</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            Preview five full pages first, or return to secure checkout whenever you are ready.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <a
            href="/downloads/twigthetics-guide-preview.pdf"
            className="btn-secondary min-h-12"
          >
            View free preview
          </a>
          <GuideCheckoutLink className="btn-primary btn-guide-glow min-h-12 px-5">
            Return to checkout
          </GuideCheckoutLink>
        </div>
      </div>
    </section>
  );
}
