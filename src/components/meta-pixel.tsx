"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  flushMetaEvents,
  META_CONSENT_COOKIE,
  trackMetaEvent,
} from "@/lib/meta/browser";

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

function hasConsent() {
  return document.cookie
    .split(";")
    .some((value) => value.trim() === `${META_CONSENT_COOKIE}=granted`);
}

export function MetaPixel() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function syncConsent() {
      setEnabled(hasConsent());
    }

    syncConsent();
    window.addEventListener("twig:marketing-consent", syncConsent);
    return () => window.removeEventListener("twig:marketing-consent", syncConsent);
  }, []);

  useEffect(() => {
    if (!enabled) {
      previousPath.current = null;
      return;
    }

    if (previousPath.current && previousPath.current !== pathname) {
      trackMetaEvent("PageView");
    }

    previousPath.current = pathname;
  }, [enabled, pathname]);

  if (!pixelId || !enabled) {
    return null;
  }

  const safePixelId = JSON.stringify(pixelId);

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onReady={flushMetaEvents}
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${safePixelId});fbq('track','PageView');`,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
