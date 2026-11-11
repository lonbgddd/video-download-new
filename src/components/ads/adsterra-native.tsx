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
  const [shouldLoad, setShouldLoad] = useState(false);
  const unit = getAdsterraNativeUnit(placement);

  useEffect(() => {
    const slot = slotRef.current;
    if (!enabled || !active || !unit || !slot) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "250px 0px" });
    observer.observe(slot);
    return () => observer.disconnect();
  }, [active, enabled, unit]);

  if (!enabled || !unit) return null;

  return (
    <aside
      ref={slotRef}
      className={`ad-slot adsterra-native-slot ad-placement-${placement}`}
      aria-label={label}
      data-ad-network="adsterra-native"
      data-ad-placement={placement}
    >
      <span className="ad-disclosure">{label}</span>
      {active && shouldLoad && (
        <>
          <Script
            id={`adsterra-native-script-${placement}`}
            src={unit.scriptUrl}
            strategy="lazyOnload"
            async
            defer
            data-cfasync="false"
          />
          <div id={unit.containerId} />
        </>
      )}
    </aside>
  );
}
