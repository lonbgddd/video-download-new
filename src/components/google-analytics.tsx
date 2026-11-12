"use client";

import { useEffect } from "react";
import {
  disableFirebaseAnalytics,
  getFirebaseAnalytics,
} from "@/lib/firebase";
import { useCookieConsent } from "@/privacy/consent-store";

export function GoogleAnalytics() {
  const consent = useCookieConsent();

  useEffect(() => {
    if (consent?.analytics === true) {
      void getFirebaseAnalytics().catch((error: unknown) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase Analytics could not be initialized.", error);
        }
      });
    } else {
      disableFirebaseAnalytics();
    }
  }, [consent?.analytics]);

  return null;
}
