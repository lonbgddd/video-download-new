"use client";

import { useEffect } from "react";
import {
  ADSTERRA_POPUNDER_INTERVAL_MS,
  ADSTERRA_POPUNDER_SCRIPT_URL,
  ADSTERRA_POPUNDER_STORAGE_KEY,
} from "@/config/ad-networks";
import { useCookieConsent } from "@/privacy/consent-store";

const PROVIDED_POPUNDER_SCRIPT = String.raw`(function(){var t=window,i="b9013ced2cd9a76dc8401e50b9433de1",z=[["siteId",119-307*370+5440327],["minBid",0],["popundersPerIP","0"],["delayBetween",0],["default",false],["defaultPerDay",0],["topmostLayer","auto"]],b=["d3d3LmRpc3BsYXl2ZXJ0aXNpbmcuY29tL0NmRS9NL2ttb2Rlcm5penIubWluLmpz","ZDNtem9rdHk5NTFjNXcuY2xvdWRmcm9udC5uZXQvZmNhcnRvLm1pbi5qcw=="],l=-1,s,f,j=function(){clearTimeout(f);l++;if(b[l]&&!(1820376406000<(new Date).getTime()&&1<l)){s=t.document.createElement("script");s.type="text/javascript";s.async=!0;var w=t.document.getElementsByTagName("script")[0];s.src="https://"+atob(b[l]);s.crossOrigin="anonymous";s.onerror=j;s.onload=function(){clearTimeout(f);t[i.slice(0,16)+i.slice(0,16)]||j()};f=setTimeout(j,5E3);w.parentNode.insertBefore(s,w)}};if(!t[i]){try{Object.freeze(t[i]=z)}catch(e){}j()}})();`;

export type AdsterraPopunderVariant = "existing" | "provided";

export function AdsterraPopunder({
  enabled,
  variant = "existing",
}: {
  enabled: boolean;
  variant?: AdsterraPopunderVariant;
}) {
  const consent = useCookieConsent();

  useEffect(() => {
    if (!enabled || consent?.advertising !== true) return;

    const now = Date.now();
    try {
      const lastShownAt = Number(localStorage.getItem(ADSTERRA_POPUNDER_STORAGE_KEY) ?? 0);
      if (Number.isFinite(lastShownAt) && now - lastShownAt < ADSTERRA_POPUNDER_INTERVAL_MS) return;
      localStorage.setItem(ADSTERRA_POPUNDER_STORAGE_KEY, String(now));
    } catch {
      // Storage can be unavailable in strict privacy modes; avoid an uncontrolled popunder.
      return;
    }
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.dataset.cfasync = "false";
    script.dataset.adNetwork = "adsterra-popunder";
    if (variant === "provided") {
      script.textContent = PROVIDED_POPUNDER_SCRIPT;
    } else {
      script.src = ADSTERRA_POPUNDER_SCRIPT_URL;
      script.async = true;
      script.defer = true;
    }
    document.body.appendChild(script);

    return () => script.remove();
  }, [consent?.advertising, enabled, variant]);

  return null;
}
