export const META_CONSENT_COOKIE = "tw_marketing_consent";

type MetaEvent = {
  eventName: string;
  parameters?: Record<string, unknown>;
  eventId?: string;
};

type MetaPixelFunction = (
  command: string,
  eventName: string,
  parameters?: Record<string, unknown>,
  options?: { eventID?: string },
) => void;

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    __twigMetaQueue?: MetaEvent[];
  }
}

function readConsent() {
  if (typeof document === "undefined") {
    return null;
  }

  const consentCookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(`${META_CONSENT_COOKIE}=`));

  return consentCookie?.split("=")[1] || null;
}

export function trackMetaEvent(
  eventName: string,
  parameters?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined" || readConsent() === "denied") {
    return;
  }

  if (window.fbq) {
    window.fbq(
      "track",
      eventName,
      parameters,
      eventId ? { eventID: eventId } : undefined,
    );
    return;
  }

  window.__twigMetaQueue = window.__twigMetaQueue || [];
  window.__twigMetaQueue.push({ eventName, parameters, eventId });
}

export function flushMetaEvents() {
  if (typeof window === "undefined" || !window.fbq) {
    return;
  }

  const queuedEvents = window.__twigMetaQueue || [];
  window.__twigMetaQueue = [];

  for (const event of queuedEvents) {
    window.fbq(
      "track",
      event.eventName,
      event.parameters,
      event.eventId ? { eventID: event.eventId } : undefined,
    );
  }
}
