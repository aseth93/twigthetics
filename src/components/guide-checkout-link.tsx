"use client";

import { useState, type ReactNode } from "react";
import { trackMetaEvent } from "@/lib/meta/browser";

type GuideCheckoutLinkProps = {
  children: ReactNode;
  className?: string;
};

export function GuideCheckoutLink({
  children,
  className,
}: GuideCheckoutLinkProps) {
  const [isOpening, setIsOpening] = useState(false);

  const openCheckout = async () => {
    if (isOpening) {
      return;
    }

    setIsOpening(true);

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

    trackMetaEvent(
      "InitiateCheckout",
      {
        currency: "USD",
        value: 49.99,
        content_name: "The Lean, Athletic Physique Guide",
        content_category: "Digital fitness guide",
        content_ids: ["lean-athletic-physique-guide"],
        content_type: "product",
      },
      eventId,
    );

    try {
      const response = await fetch(
        `/api/guide/checkout?${checkoutParams.toString()}`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        },
      );
      const result = (await response.json()) as { url?: string };

      if (!response.ok || !result.url) {
        throw new Error("Checkout could not be opened.");
      }

      window.location.assign(result.url);
    } catch {
      window.location.assign("/guide?checkout=error");
    }
  };

  return (
    <button
      type="button"
      className={className}
      disabled={isOpening}
      aria-busy={isOpening}
      onClick={openCheckout}
    >
      {isOpening ? "Opening secure checkout..." : children}
    </button>
  );
}
