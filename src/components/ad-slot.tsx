import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";
import { AdsterraNative } from "@/components/ads/adsterra-native";
import { AdsterraSocialBar } from "@/components/ads/adsterra-social-bar";
import { MonetagZone } from "@/components/ads/monetag-zone";

export function AdSlot({ position, locale = "vi" }: { position: "mid-article" | "end-article"; locale?: Locale }) {
  const enabled = process.env.ADS_ENABLED === "true";
  if (position === "mid-article") {
    return (
      <>
        <AdsterraSocialBar enabled={enabled} />
        <MonetagZone enabled={enabled} />
      </>
    );
  }
  return <AdsterraNative enabled={enabled} label={UI_CONTENT[locale].misc.ad} />;
}
