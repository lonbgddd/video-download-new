import type { Metadata } from "next";
import {
  getLocalizedRoute,
  getRouteForPage,
  LOCALE_INFO,
  LOCALES,
  SITE_NAME,
  type LocalizedRoute,
} from "@/config/i18n.config";
import { getSiteUrl } from "@/config/site-url";

const siteUrl = getSiteUrl();

export function getAbsoluteUrl(path: string): string {
  return new URL(path.replace(/^\/+/, ""), `${siteUrl.origin}/`).href;
}

export function getLocalizedPath(route: Pick<LocalizedRoute, "locale" | "topic" | "slug">): string {
  return `/${route.locale}/${route.topic}/${route.slug}`;
}

export function generateLandingMetadata(route: LocalizedRoute): Metadata {
  const canonical = getAbsoluteUrl(getLocalizedPath(route));
  const languages: Record<string, string> = {};

  for (const locale of LOCALES) {
    const alternate = getRouteForPage(route.page, locale);
    languages[locale] = getAbsoluteUrl(getLocalizedPath(alternate));
  }
  const defaultRoute = getRouteForPage(route.page, "en");
  languages["x-default"] = getAbsoluteUrl(getLocalizedPath(defaultRoute));

  return {
    title: route.content.title,
    description: route.content.description,
    keywords: route.content.keywords,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: SITE_NAME,
      title: route.content.title,
      description: route.content.description,
      locale: LOCALE_INFO[route.locale].ogLocale,
      alternateLocale: LOCALES.filter((locale) => locale !== route.locale).map((locale) => LOCALE_INFO[locale].ogLocale),
    },
    twitter: {
      card: "summary",
      title: route.content.title,
      description: route.content.description,
    },
    robots: { index: true, follow: true },
  };
}

export function getLocalizedRouteByParams(locale: string, topic: string, slug: string): LocalizedRoute | undefined {
  return getLocalizedRoute(locale, topic, slug);
}
