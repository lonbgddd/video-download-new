"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import {
  ADCASH_INTERSTITIAL_MIN_INTERVAL_MS,
  ADCASH_INTERSTITIAL_ZONE_ID,
  ADCASH_LIBRARY_SCRIPT_URL,
} from "@/config/ad-networks";

const ADCASH_INTERSTITIAL_REQUEST_EVENT =
  "video-downloader:adcash-interstitial-request";

export type AdcashInterstitialPlacement =
  | "analyze-submit"
  | "download-submit"
  | "download-dialog";

declare global {
  interface Window {
    aclib?: {
      runInterstitial?: (options: { zoneId: string }) => void;
    };
  }
}

/**
 * Request an Adcash Interstitial from a user action. The layout-level loader
 * receives this event and safely no-ops when ads or the Adcash library are not
 * available. Keep the real zone ID in NEXT_PUBLIC_ADCASH_INTERSTITIAL_ZONE_ID.
 */
export function requestAdcashInterstitial(
  placement: AdcashInterstitialPlacement,
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AdcashInterstitialPlacement>(
      ADCASH_INTERSTITIAL_REQUEST_EVENT,
      { detail: placement },
    ),
  );
}

export function AdcashInterstitial({ enabled }: { enabled: boolean }) {
  const libraryReadyRef = useRef(false);
  const pendingRef = useRef(false);
  const lastShownAtRef = useRef(0);

  const runInterstitial = useCallback(() => {
    if (!enabled || !libraryReadyRef.current) return false;
    const run = window.aclib?.runInterstitial;
    if (!run) return false;

    const now = Date.now();
    if (
      now - lastShownAtRef.current <
      ADCASH_INTERSTITIAL_MIN_INTERVAL_MS
    ) {
      return false;
    }

    try {
      run({ zoneId: ADCASH_INTERSTITIAL_ZONE_ID });
      lastShownAtRef.current = now;
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Adcash interstitial trigger failed.", error);
      }
      return false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onRequest = () => {
      if (!libraryReadyRef.current || !window.aclib?.runInterstitial) {
        pendingRef.current = true;
        return;
      }
      runInterstitial();
    };
    window.addEventListener(ADCASH_INTERSTITIAL_REQUEST_EVENT, onRequest);
    return () =>
      window.removeEventListener(ADCASH_INTERSTITIAL_REQUEST_EVENT, onRequest);
  }, [enabled, runInterstitial]);

  if (!enabled) return null;

  const onLibraryReady = () => {
    libraryReadyRef.current = true;
    if (pendingRef.current) {
      pendingRef.current = false;
      runInterstitial();
    }
  };

  return (
    <Script
      id="adcash-aclib-interstitial"
      src={ADCASH_LIBRARY_SCRIPT_URL}
      strategy="afterInteractive"
      onLoad={onLibraryReady}
      onReady={onLibraryReady}
      onError={() => {
        pendingRef.current = false;
        if (process.env.NODE_ENV === "development") {
          console.warn("Adcash interstitial library failed to load.");
        }
      }}
    />
  );
}
