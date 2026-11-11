"use client";

import Script from "next/script";
import {
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SCRIPT_URL,
} from "@/config/ad-networks";

export function AdsterraNative({ enabled, label }: { enabled: boolean; label: string }) {
  if (!enabled) return null;

  return (
    <aside className="ad-slot adsterra-native-slot" aria-label={label} data-ad-network="adsterra-native">
      <Script
        id="adsterra-native-script"
        src={ADSTERRA_NATIVE_SCRIPT_URL}
        strategy="lazyOnload"
        async
        defer
        data-cfasync="false"
      />
      <div id={ADSTERRA_NATIVE_CONTAINER_ID} />
    </aside>
  );
}
