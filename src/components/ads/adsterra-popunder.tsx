"use client";

import { useEffect } from "react";
import {
  ADSTERRA_POPUNDER_INTERVAL_MS,
  ADSTERRA_POPUNDER_SCRIPT_URL,
  ADSTERRA_POPUNDER_STORAGE_KEY,
} from "@/config/ad-networks";

export function AdsterraPopunder({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;

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
    script.src = ADSTERRA_POPUNDER_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.dataset.cfasync = "false";
    script.dataset.adNetwork = "adsterra-popunder";
    document.body.appendChild(script);

    return () => script.remove();
  }, [enabled]);

  return null;
}
