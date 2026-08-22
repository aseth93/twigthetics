"use client";

import { useEffect } from "react";
import { trackMetaEvent } from "@/lib/meta/browser";

export function GuideViewTracker() {
  useEffect(() => {
    trackMetaEvent("ViewContent", {
      currency: "USD",
      value: 49.99,
      content_name: "The Lean, Athletic Physique Guide",
      content_category: "Digital fitness guide",
      content_ids: ["lean-athletic-physique-guide"],
      content_type: "product",
    });
  }, []);

  return null;
}
