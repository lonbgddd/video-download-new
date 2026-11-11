import { AdsterraPopunder } from "./adsterra-popunder";
import { AdcashInterstitial } from "./adcash-interstitial";
import { MonetagInPagePush } from "./monetag-in-page-push";

export function AdNetworkScripts({ enabled }: { enabled: boolean }) {
  return (
    <>
      <MonetagInPagePush enabled={enabled} />
      <AdcashInterstitial enabled={enabled} />
      <AdsterraPopunder enabled={enabled} />
    </>
  );
}
