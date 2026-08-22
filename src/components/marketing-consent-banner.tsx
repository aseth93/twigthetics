"use client";

import { useEffect, useState } from "react";
import { META_CONSENT_COOKIE } from "@/lib/meta/browser";

const pixelConfigured = Boolean(
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim(),
);
const cookieMaxAge = 60 * 60 * 24 * 180;

function saveConsent(value: "granted" | "denied") {
  document.cookie = `${META_CONSENT_COOKIE}=${value}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax; Secure`;
  window.dispatchEvent(new Event("twig:marketing-consent"));
}

export function MarketingConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pixelConfigured) {
      return;
    }

    const hasChoice = document.cookie
      .split(";")
      .some((value) => value.trim().startsWith(`${META_CONSENT_COOKIE}=`));
    setVisible(!hasChoice);

    function showPreferences() {
      setVisible(true);
    }

    window.addEventListener("twig:show-marketing-consent", showPreferences);
    return () =>
      window.removeEventListener("twig:show-marketing-consent", showPreferences);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <aside className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-[1.35rem] border border-white/15 bg-[#1d211d] p-4 text-white shadow-2xl sm:bottom-5 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-white/75">
          Twigthetics uses optional Meta advertising cookies to measure guide sales
          and improve ads. You can decline without affecting the site.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
            onClick={() => {
              saveConsent("denied");
              setVisible(false);
            }}
          >
            Decline
          </button>
          <button
            type="button"
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink)]"
            onClick={() => {
              saveConsent("granted");
              setVisible(false);
            }}
          >
            Allow
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MarketingPreferencesButton() {
  if (!pixelConfigured) {
    return null;
  }

  return (
    <button
      type="button"
      className="quiet-link"
      onClick={() => window.dispatchEvent(new Event("twig:show-marketing-consent"))}
    >
      Manage advertising preferences
    </button>
  );
}
