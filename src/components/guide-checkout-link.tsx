"use client";

import type { ReactNode } from "react";
import { trackMetaEvent } from "@/lib/meta/browser";

type GuideCheckoutLinkProps = {
  children: ReactNode;
  className?: string;
};

export function GuideCheckoutLink({
  children,
  className,
}: GuideCheckoutLinkProps) {
  return (
    <a
      href="/api/guide/checkout"
      className={className}
      onClick={() =>
        trackMetaEvent("InitiateCheckout", {
          currency: "USD",
          value: 49.99,
          content_name: "The Lean, Athletic Physique Guide",
          content_category: "Digital fitness guide",
          content_ids: ["lean-athletic-physique-guide"],
          content_type: "product",
        })
      }
    >
      {children}
    </a>
  );
}
