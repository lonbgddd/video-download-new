"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  getAdsterraNativeUnit,
  type AdsterraNativePlacement,
} from "@/config/ad-networks";

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
  const unit = getAdsterraNativeUnit(placement);
  const shouldLoadImmediately = [
    "above-header",
    "side-left",
    "side-right",
    "near-input",
  ].includes(placement);
  const [shouldLoad, setShouldLoad] = useState(shouldLoadImmediately);

  useEffect(() => {
    const slot = slotRef.current;
    if (
      !enabled ||
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
  }, [active, enabled, shouldLoadImmediately, unit]);

  if (!enabled || (!unit && !shouldLoadImmediately)) return null;

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
        <div className="ad-slot-placeholder" aria-hidden="true">
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
