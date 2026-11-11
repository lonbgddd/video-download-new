"use client";

import { AdsterraPopunder } from "./adsterra-popunder";
import { AdcashInterstitial } from "./adcash-interstitial";
import { MonetagInPagePush } from "./monetag-in-page-push";
import { useCookieConsent } from "@/privacy/consent-store";

export function AdNetworkScripts({ enabled }: { enabled: boolean }) {
  const consent = useCookieConsent();
  const advertisingEnabled = enabled && consent?.advertising === true;
  return (
    <>
      <MonetagInPagePush enabled={advertisingEnabled} />
      <AdcashInterstitial enabled={advertisingEnabled} />
      <AdsterraPopunder enabled={advertisingEnabled} />
    </>
  );
}
