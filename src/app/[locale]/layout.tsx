import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { LOCALES, LOCALE_INFO, SITE_NAME, isLocale } from "@/config/i18n.config";
import { getSiteUrl } from "@/config/site-url";
import "../globals.css";
import { Providers } from "../providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f17" },
  ],
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return {
    metadataBase: getSiteUrl(),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    openGraph: { siteName: SITE_NAME, locale: LOCALE_INFO[locale].ogLocale, type: "website" },
    twitter: { card: "summary" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <html lang={locale} suppressHydrationWarning><body><Providers><div className={`locale-shell locale-${locale}`}>{children}</div></Providers><Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5107605542667246" strategy="beforeInteractive" crossOrigin="anonymous" /></body></html>;
}
