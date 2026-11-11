import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";
import { AdsterraNative } from "@/components/ads/adsterra-native";
import { AdsterraSocialBar } from "@/components/ads/adsterra-social-bar";
import { areAdsEnabled } from "@/config/ad-networks";

export type AdSlotPosition =
  | "mid-article"
  | "end-article"
  | "above-header"
  | "side-left"
  | "side-right"
  | "near-input"
  | "download-modal";

export function AdSlot({
  position,
  locale = "vi",
  active = true,
}: {
  position: AdSlotPosition;
  locale?: Locale;
  active?: boolean;
}) {
  const enabled = areAdsEnabled();
  if (position === "mid-article") {
    return <AdsterraSocialBar enabled={enabled} />;
  }
  return (
    <AdsterraNative
      enabled={enabled}
      active={active}
      placement={position}
      label={UI_CONTENT[locale].misc.ad}
    />
  );
}
