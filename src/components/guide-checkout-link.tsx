"use client";

import { useEffect, useState, type ReactNode } from "react";
import { trackMetaEvent } from "@/lib/meta/browser";

type GuideCheckoutLinkProps = {
  children: ReactNode;
  className?: string;
};

export function GuideCheckoutLink({
  children,
  className,
}: GuideCheckoutLinkProps) {
  const [checkoutHref, setCheckoutHref] = useState("/api/guide/checkout");
  const [metaEventId, setMetaEventId] = useState<string>();

  useEffect(() => {
    const landingParams = new URLSearchParams(window.location.search);
    const checkoutParams = new URLSearchParams();
    const eventId = window.crypto.randomUUID();

    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
    ]) {
      const value = landingParams.get(key)?.trim();

      if (value) {
        checkoutParams.set(key, value.slice(0, 200));
      }
    }

    checkoutParams.set("landing_path", window.location.pathname);
    checkoutParams.set("meta_event_id", eventId);
    setMetaEventId(eventId);
    setCheckoutHref(`/api/guide/checkout?${checkoutParams.toString()}`);
  }, []);

  return (
    <a
      href={checkoutHref}
      className={className}
      onClick={() =>
        trackMetaEvent("InitiateCheckout", {
          currency: "USD",
          value: 49.99,
          content_name: "The Lean, Athletic Physique Guide",
          content_category: "Digital fitness guide",
          content_ids: ["lean-athletic-physique-guide"],
          content_type: "product",
        }, metaEventId)
      }
    >
      {children}
    </a>
  );
}
