"use client";

import { useEffect } from "react";
import { getGuideAttribution, getGuideVisitorId } from "@/lib/guide/browser";
import { trackMetaEvent } from "@/lib/meta/browser";

export function GuideViewTracker({ priceCents }: { priceCents: number }) {
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      currency: "USD",
      value: priceCents / 100,
      content_name: "The Lean, Athletic Physique Guide",
      content_category: "Digital fitness guide",
      content_ids: ["lean-athletic-physique-guide"],
      content_type: "product",
    });

    const storageKey = "tw_guide_view_tracked";
    if (window.sessionStorage.getItem(storageKey)) {
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");
    void fetch("/api/guide/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName: "view_content",
        visitorId: getGuideVisitorId(),
        path: window.location.pathname,
        attribution: getGuideAttribution(),
      }),
    });
  }, [priceCents]);

  return null;
}
