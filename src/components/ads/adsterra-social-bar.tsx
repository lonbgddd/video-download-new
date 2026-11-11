"use client";

import Script from "next/script";
import { ADSTERRA_SOCIAL_BAR_SCRIPT_URL } from "@/config/ad-networks";

export function AdsterraSocialBar({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <Script
      id="adsterra-social-bar"
      src={ADSTERRA_SOCIAL_BAR_SCRIPT_URL}
      strategy="lazyOnload"
      async
      defer
      data-cfasync="false"
      data-ad-network="adsterra-social-bar"
    />
  );
}
