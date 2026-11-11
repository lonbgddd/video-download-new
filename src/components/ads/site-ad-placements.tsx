import { AdSlot } from "@/components/ad-slot";
import type { Locale } from "@/config/locales";
import { UI_CONTENT } from "@/config/ui-content";
import { areAdsEnabled } from "@/config/ad-networks";

export function SiteAdPlacements({ locale }: { locale: Locale }) {
  if (!areAdsEnabled()) return null;

  return (
    <>
      <AdSlot position="above-header" locale={locale} />
      <div className="ad-side-rails" aria-label={UI_CONTENT[locale].misc.ad}>
        <AdSlot position="side-left" locale={locale} />
        <AdSlot position="side-right" locale={locale} />
      </div>
    </>
  );
}
