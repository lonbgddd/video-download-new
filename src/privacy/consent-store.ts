"use client";

import { useSyncExternalStore } from "react";

export const CONSENT_COOKIE_NAME = "vd_cookie_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;

export interface CookieConsent {
  version: number;
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
}
let currentConsent: CookieConsent | null | undefined;
const listeners = new Set<() => void>();

function parseStoredConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${CONSENT_COOKIE_NAME}=`))
    ?.slice(CONSENT_COOKIE_NAME.length + 1);
  if (!raw) return null;

  try {
    const value = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsent>;
    if (
      value.version !== CONSENT_VERSION ||
      typeof value.analytics !== "boolean" ||
      typeof value.advertising !== "boolean"
    ) {
      return null;
    }
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: value.analytics,
      advertising: value.advertising,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    };
  } catch {
    return null;
  }
}

function getSnapshot(): CookieConsent | null {
  if (currentConsent === undefined) currentConsent = parseStoredConsent();
  return currentConsent;
}

export function hasAnalyticsConsent(): boolean {
  return getSnapshot()?.analytics === true;
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

function deleteFirstPartyOptionalCookies() {
  document.cookie.split(";").forEach((item) => {
    const name = item.split("=")[0]?.trim();
    if (!name || (!name.startsWith("_ga") && !name.startsWith("_gid") && !name.startsWith("_gat"))) return;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
  });
}

export function hasGlobalPrivacyControl(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean })
    .globalPrivacyControl === true;
}

export function saveCookieConsent(
  choices: Pick<CookieConsent, "analytics" | "advertising">,
): CookieConsent {
  const previous = getSnapshot();
  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics: choices.analytics,
    advertising: hasGlobalPrivacyControl() ? false : choices.advertising,
    updatedAt: new Date().toISOString(),
  };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  currentConsent = consent;
  if ((previous?.analytics && !consent.analytics) || (previous?.advertising && !consent.advertising)) {
    deleteFirstPartyOptionalCookies();
  }
  notify();
  return consent;
}

export function useCookieConsent(): CookieConsent | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
