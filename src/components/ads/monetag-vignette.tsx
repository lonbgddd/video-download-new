"use client";

import Script from "next/script";
import {
  MONETAG_VIGNETTE_SCRIPT_URL,
  MONETAG_VIGNETTE_ZONE_ID,
} from "@/config/ad-networks";
import { useCookieConsent } from "@/privacy/consent-store";
import { useAdExperiments } from "./ad-experiments-provider";

/**
 * Mount this component only while an action dialog is open. Next.js loads the
 * Vignette script once per page session and does not put a raw script tag into
 * the server-rendered dialog markup.
 *
 * Replace NEXT_PUBLIC_MONETAG_VIGNETTE_* in `.env` for a different zone.
 */
export function MonetagVignette({
  enabled,
  active,
}: {
  enabled: boolean;
  active: boolean;
}) {
  const consent = useCookieConsent();
  const experiments = useAdExperiments();
  if (
    !enabled ||
    !active ||
    !experiments.ready ||
    !experiments.monetagVignette ||
    consent?.advertising !== true
  ) {
    return null;
  }

  return (
    <Script
      id={`monetag-vignette-${MONETAG_VIGNETTE_ZONE_ID}`}
      src={MONETAG_VIGNETTE_SCRIPT_URL}
      strategy="afterInteractive"
      data-zone={MONETAG_VIGNETTE_ZONE_ID}
      data-trigger="download-dialog-open"
      data-cfasync="false"
      onError={() => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Monetag Vignette failed to load.");
        }
      }}
    />
  );
}
