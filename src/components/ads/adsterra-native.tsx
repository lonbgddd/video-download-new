"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import {
  ADSTERRA_NATIVE_CONTAINER_ID,
  ADSTERRA_NATIVE_SCRIPT_URL,
} from "@/config/ad-networks";

export function AdsterraNative({ enabled, label }: { enabled: boolean; label: string }) {
  const slotRef = useRef<HTMLElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!enabled || !slot) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "250px 0px" });
    observer.observe(slot);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <aside ref={slotRef} className="ad-slot adsterra-native-slot" aria-label={label} data-ad-network="adsterra-native" data-ad-placement="end-article">
      <span className="ad-disclosure">{label}</span>
      {shouldLoad && (
        <>
          <Script
            id="adsterra-native-script"
            src={ADSTERRA_NATIVE_SCRIPT_URL}
            strategy="lazyOnload"
            async
            defer
            data-cfasync="false"
          />
          <div id={ADSTERRA_NATIVE_CONTAINER_ID} />
        </>
      )}
    </aside>
  );
}
