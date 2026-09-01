export const GUIDE_VISITOR_STORAGE_KEY = "tw_guide_visitor_id";
export const GUIDE_LEAD_STORAGE_KEY = "tw_guide_lead_id";

export function getGuideVisitorId() {
  try {
    const existing = window.localStorage.getItem(GUIDE_VISITOR_STORAGE_KEY);

    if (existing) {
      return existing;
    }

    const visitorId = window.crypto.randomUUID();
    window.localStorage.setItem(GUIDE_VISITOR_STORAGE_KEY, visitorId);
    return visitorId;
  } catch {
    return window.crypto.randomUUID();
  }
}

export function getGuideAttribution() {
  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {
    landingPath: window.location.pathname,
  };
  const mapping = {
    utm_source: "source",
    utm_medium: "medium",
    utm_campaign: "campaign",
    utm_content: "content",
    utm_term: "term",
    fbclid: "fbclid",
  } as const;

  for (const [queryKey, attributionKey] of Object.entries(mapping)) {
    const value = params.get(queryKey)?.trim();

    if (value) {
      attribution[attributionKey] = value.slice(0, 200);
    }
  }

  return attribution;
}
