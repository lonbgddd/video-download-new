"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  getAdsterraDisplayUnit,
  getAdsterraNativeUnit,
  type AdsterraNativePlacement,
} from "@/config/ad-networks";
import { AdsterraDisplayBanner } from "@/components/ads/adsterra-display-banner";
import { useCookieConsent } from "@/privacy/consent-store";
import { useAdExperiments } from "./ad-experiments-provider";

export function AdsterraNative({
  enabled,
  label,
  placement = "end-article",
  active = true,
}: {
  enabled: boolean;
  label: string;
  placement?: AdsterraNativePlacement;
  active?: boolean;
}) {
  const slotRef = useRef<HTMLElement>(null);
  const consent = useCookieConsent();
  const experiments = useAdExperiments();
  const displayUnit = getAdsterraDisplayUnit(placement);
  const unit = getAdsterraNativeUnit(placement);
  const formatEnabled = displayUnit
    ? experiments.adsterraDisplay
    : experiments.adsterraNative;
  const advertisingEnabled =
    enabled &&
    experiments.ready &&
    formatEnabled &&
    consent?.advertising === true;
  const shouldLoadImmediately = [
    "above-header",
    "side-left",
    "side-right",
    "near-input",
    "download-modal",
  ].includes(placement);
  const [shouldLoad, setShouldLoad] = useState(shouldLoadImmediately);

  useEffect(() => {
    const slot = slotRef.current;
    if (
      !advertisingEnabled ||
      !active ||
      shouldLoadImmediately ||
      !unit ||
      !slot
    ) {
      return;
    }
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "250px 0px" });
    observer.observe(slot);
    return () => observer.disconnect();
  }, [active, advertisingEnabled, shouldLoadImmediately, unit]);

  if (!advertisingEnabled || !active || (!unit && !shouldLoadImmediately)) return null;

  if (displayUnit) {
    return (
      <aside
        className={`ad-slot adsterra-native-slot adsterra-display-slot ad-placement-${placement}`}
        aria-label={label}
        data-ad-network="adsterra-display"
        data-ad-placement={placement}
        data-ad-state="configured"
      >
        <span className="ad-disclosure">{label}</span>
        <AdsterraDisplayBanner
          unit={displayUnit}
          title={`${label} ${displayUnit.width} × ${displayUnit.height}`}
        />
      </aside>
    );
  }

  return (
    <aside
      ref={slotRef}
      className={`ad-slot adsterra-native-slot ad-placement-${placement}`}
      aria-label={label}
      data-ad-network="adsterra-native"
      data-ad-placement={placement}
      data-ad-state={unit ? "configured" : "unconfigured"}
    >
      <span className="ad-disclosure">{label}</span>
      {!unit && (
        <div className="ad-slot-placeholder">
          <span>{label}</span>
          <small>Banner zone chưa được cấu hình</small>
          {/*
            Configure the matching NEXT_PUBLIC_ADSTERRA_*_SCRIPT_URL and
            NEXT_PUBLIC_ADSTERRA_*_CONTAINER_ID pair in `.env` for this slot.
            Never reuse one native container ID in multiple placements.
          */}
        </div>
      )}
      {unit && active && shouldLoad && (
        <>
          <div id={unit.containerId} />
          <Script
            id={`adsterra-native-script-${placement}`}
            src={unit.scriptUrl}
            strategy={
              shouldLoadImmediately ? "afterInteractive" : "lazyOnload"
            }
            async
            defer
            data-cfasync="false"
          />
        </>
      )}
    </aside>
  );
}
