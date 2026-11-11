import { AdsterraPopunder } from "./adsterra-popunder";

export function AdNetworkScripts({ enabled }: { enabled: boolean }) {
  return (
    <>
      <AdsterraPopunder enabled={enabled} />
    </>
  );
}
