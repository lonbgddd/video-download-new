"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { MONETAG_SCRIPT_URL, MONETAG_ZONE_ID } from "@/config/ad-networks";

export function MonetagZone({ enabled }: { enabled: boolean }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!enabled || !trigger || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: "250px 0px" });
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={triggerRef} className="ad-social-trigger" aria-hidden="true" data-ad-placement="mid-article" />
      {shouldLoad && (
        <Script
          id={`monetag-zone-${MONETAG_ZONE_ID}`}
          src={MONETAG_SCRIPT_URL}
          strategy="lazyOnload"
          async
          data-zone={MONETAG_ZONE_ID}
          data-cfasync="false"
        />
      )}
    </>
  );
}
