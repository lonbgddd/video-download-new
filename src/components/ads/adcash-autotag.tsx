"use client";

import Script from "next/script";
import { useRef } from "react";
import {
  ADCASH_AUTOTAG_ZONE_ID,
  ADCASH_LIBRARY_SCRIPT_URL,
} from "@/config/ad-networks";

declare global {
  interface Window {
    aclib?: { runAutoTag: (options: { zoneId: string }) => void };
  }
}

export function AdcashAutoTag({ enabled }: { enabled: boolean }) {
  const hasStarted = useRef(false);
  if (!enabled) return null;

  const runAutoTag = () => {
    if (hasStarted.current || !window.aclib) return;
    hasStarted.current = true;
    window.aclib.runAutoTag({ zoneId: ADCASH_AUTOTAG_ZONE_ID });
  };

  return (
    <div id="adcash-autotag-root" data-ad-network="adcash-autotag" data-zone-id={ADCASH_AUTOTAG_ZONE_ID}>
      <Script
        id="adcash-aclib"
        src={ADCASH_LIBRARY_SCRIPT_URL}
        strategy="lazyOnload"
        async
        defer
        onLoad={runAutoTag}
        onReady={runAutoTag}
      />
    </div>
  );
}
