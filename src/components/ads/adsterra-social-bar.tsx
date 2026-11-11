"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { ADSTERRA_SOCIAL_BAR_SCRIPT_URL } from "@/config/ad-networks";

export function AdsterraSocialBar({ enabled }: { enabled: boolean }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!enabled || !trigger) return;
    if (!("IntersectionObserver" in window)) return;

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
          id="adsterra-social-bar"
          src={ADSTERRA_SOCIAL_BAR_SCRIPT_URL}
          strategy="lazyOnload"
          async
          defer
          data-cfasync="false"
          data-ad-network="adsterra-social-bar"
        />
      )}
    </>
  );
}
