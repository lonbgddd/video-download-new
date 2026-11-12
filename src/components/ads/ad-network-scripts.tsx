"use client";

import { AdsterraPopunder } from "./adsterra-popunder";
import { AdcashInterstitial } from "./adcash-interstitial";
import { MonetagInPagePush } from "./monetag-in-page-push";
import { useCookieConsent } from "@/privacy/consent-store";
import { useAdExperiments } from "./ad-experiments-provider";

export function AdNetworkScripts({ enabled }: { enabled: boolean }) {
  const consent = useCookieConsent();
  const experiments = useAdExperiments();
  const advertisingEnabled =
    enabled && experiments.ready && consent?.advertising === true;
  return (
    <>
      <MonetagInPagePush
        enabled={advertisingEnabled && experiments.monetagInPagePush}
      />
      <AdcashInterstitial
        enabled={advertisingEnabled && experiments.adcashInterstitial}
      />
      <AdsterraPopunder
        enabled={advertisingEnabled && experiments.adsterraPopunder}
        variant={experiments.adsterraPopunderVariant}
      />
    </>
  );
}
