import { AdcashAutoTag } from "./adcash-autotag";
import { AdsterraPopunder } from "./adsterra-popunder";
import { AdsterraSocialBar } from "./adsterra-social-bar";

export function AdNetworkScripts({ enabled }: { enabled: boolean }) {
  return (
    <>
      <AdsterraPopunder enabled={enabled} />
      <AdsterraSocialBar enabled={enabled} />
      <AdcashAutoTag enabled={enabled} />
    </>
  );
}
