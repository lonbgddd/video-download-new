import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";
import { AdsterraNative } from "@/components/ads/adsterra-native";

export function AdSlot({ position, locale = "vi" }: { position: "below-analyzer" | "between-sections" | "mobile-sticky"; locale?: Locale }) {
  const enabled = process.env.ADS_ENABLED === "true";
  if (position !== "below-analyzer") return null;
  return <AdsterraNative enabled={enabled} label={UI_CONTENT[locale].misc.ad} />;
}
