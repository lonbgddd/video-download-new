"use client";

import Script from "next/script";
import {
  MONETAG_IN_PAGE_PUSH_SCRIPT_URL,
  MONETAG_IN_PAGE_PUSH_ZONE_ID,
} from "@/config/ad-networks";

/**
 * Global Monetag In-Page Push loader.
 *
 * The script is emitted only after hydration, so the server and first client
 * render stay identical. Replace the NEXT_PUBLIC_MONETAG_IN_PAGE_PUSH_* values
 * in `.env` when Monetag issues a new zone or script URL.
 */
export function MonetagInPagePush({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <Script
      id={`monetag-in-page-push-${MONETAG_IN_PAGE_PUSH_ZONE_ID}`}
      src={MONETAG_IN_PAGE_PUSH_SCRIPT_URL}
      strategy="afterInteractive"
      data-zone={MONETAG_IN_PAGE_PUSH_ZONE_ID}
      data-cfasync="false"
      onError={() => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Monetag In-Page Push failed to load.");
        }
      }}
    />
  );
}
