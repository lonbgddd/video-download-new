"use client";

import Script from "next/script";
import { useCookieConsent } from "@/privacy/consent-store";

const measurementId = "G-CT33X6QTYH";

export function GoogleAnalytics() {
  const consent = useCookieConsent();
  if (consent?.analytics !== true) return null;

  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    <Script id="google-analytics" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `}</Script>
  </>;
}
