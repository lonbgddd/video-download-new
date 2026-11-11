"use client";

import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { COOKIE_CONTENT } from "@/config/cookie-content";
import type { Locale } from "@/config/locales";
import {
  hasGlobalPrivacyControl,
  saveCookieConsent,
  useCookieConsent,
  type CookieConsent,
} from "@/privacy/consent-store";

export const OPEN_COOKIE_PREFERENCES_EVENT =
  "video-downloader:open-cookie-preferences";

function PreferencePanel({
  locale,
  consent,
  onClose,
}: {
  locale: Locale;
  consent: CookieConsent | null;
  onClose: () => void;
}) {
  const copy = COOKIE_CONTENT[locale];
  const gpc = hasGlobalPrivacyControl();
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
  const [advertising, setAdvertising] = useState(
    gpc ? false : (consent?.advertising ?? false),
  );

  const save = () => {
    const revoked = Boolean(
      (consent?.analytics && !analytics) ||
      (consent?.advertising && !advertising),
    );
    saveCookieConsent({ analytics, advertising });
    onClose();
    if (revoked) location.reload();
  };

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="cookie-modal-overlay" />
        <Dialog.Content className="cookie-modal" aria-describedby="cookie-settings-description">
        <header>
          <div>
            <span className="cookie-heading-icon"><ShieldCheck /></span>
            <Dialog.Title id="cookie-settings-title">{copy.settingsTitle}</Dialog.Title>
          </div>
          <Dialog.Close asChild><button type="button" className="cookie-close" aria-label={copy.close}><X /></button></Dialog.Close>
        </header>
        <Dialog.Description id="cookie-settings-description">{copy.settingsIntro}</Dialog.Description>
        {gpc && <p className="cookie-gpc" role="status">{copy.gpc}</p>}
        <div className="cookie-category-list">
          <article>
            <div><strong>{copy.necessary}</strong><p>{copy.necessaryDescription}</p></div>
            <span className="cookie-always">{copy.alwaysActive}</span>
          </article>
          <article>
            <label htmlFor="cookie-analytics"><strong>{copy.analytics}</strong><p>{copy.analyticsDescription}</p></label>
            <input id="cookie-analytics" type="checkbox" role="switch" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          </article>
          <article>
            <label htmlFor="cookie-advertising"><strong>{copy.advertising}</strong><p>{copy.advertisingDescription}</p></label>
            <input id="cookie-advertising" type="checkbox" role="switch" checked={advertising} disabled={gpc} onChange={(event) => setAdvertising(event.target.checked)} />
          </article>
        </div>
        <nav className="cookie-policy-links" aria-label={copy.settingsTitle}>
          <Link href={`/${locale}/privacy`}>{copy.privacy}</Link>
          <Link href={`/${locale}/cookies`}>{copy.cookiePolicy}</Link>
          <Link href={`/${locale}/terms`}>{copy.terms}</Link>
        </nav>
        <div className="cookie-modal-actions">
          <button type="button" className="secondary-button" onClick={() => { saveCookieConsent({ analytics: false, advertising: false }); onClose(); }}>{copy.rejectOptional}</button>
          <button type="button" className="primary-button" onClick={save}>{copy.save}</button>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function CookiePreferences({ locale }: { locale: Locale }) {
  const copy = COOKIE_CONTENT[locale];
  const consent = useCookieConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle(
      "ads-consented",
      consent?.advertising === true,
    );
  }, [consent?.advertising]);

  useEffect(() => {
    const open = () => setSettingsOpen(true);
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, open);
  }, []);

  return (
    <>
      {!consent && (
        <section className="cookie-banner" role="region" aria-labelledby="cookie-banner-title">
          <div className="cookie-banner-copy">
            <span className="cookie-heading-icon"><Cookie /></span>
            <div><h2 id="cookie-banner-title">{copy.bannerTitle}</h2><p>{copy.bannerText}</p><div className="cookie-policy-links"><Link href={`/${locale}/privacy`}>{copy.privacy}</Link><Link href={`/${locale}/cookies`}>{copy.cookiePolicy}</Link></div></div>
          </div>
          <div className="cookie-banner-actions">
            <button type="button" className="secondary-button" onClick={() => saveCookieConsent({ analytics: false, advertising: false })}>{copy.rejectOptional}</button>
            <button type="button" className="secondary-button" onClick={() => setSettingsOpen(true)}>{copy.customize}</button>
            <button type="button" className="primary-button" onClick={() => saveCookieConsent({ analytics: true, advertising: true })}>{copy.acceptAll}</button>
          </div>
        </section>
      )}
      {settingsOpen && (
        <PreferencePanel
          key={`${consent?.updatedAt ?? "new"}-${locale}`}
          locale={locale}
          consent={consent}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}

export function CookiePreferencesButton({ locale }: { locale: Locale }) {
  const copy = COOKIE_CONTENT[locale];
  return <button type="button" className="cookie-preferences-link" onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT))}>{copy.preferences}</button>;
}
