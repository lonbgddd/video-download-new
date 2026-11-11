import type { MetadataRoute } from "next";
import { getLocalizedRoutes, LOCALES } from "@/config/i18n.config";
import { getAbsoluteUrl, getLocalizedPath } from "@/lib/seo/metadata";
import { DEFAULT_LOCALE, HOME_PATHS } from "@/config/locales";

export default function sitemap(): MetadataRoute.Sitemap {
  const localizedRoutes = getLocalizedRoutes();
  const routesByPage = new Map<string, Map<string, (typeof localizedRoutes)[number]>>();
  for (const route of localizedRoutes) {
    const translations = routesByPage.get(route.page.id) ?? new Map();
    translations.set(route.locale, route);
    routesByPage.set(route.page.id, translations);
  }
  const staticRoutes = ["/history", "/terms", "/privacy", "/copyright"].map((route) => ({
    url: getAbsoluteUrl(route),
    lastModified: new Date(),
    changeFrequency: route ? "monthly" as const : "weekly" as const,
    priority: 0.6,
  }));
  const homeEntries = LOCALES.map((locale) => ({
    url: getAbsoluteUrl(HOME_PATHS[locale]),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: { languages: Object.fromEntries([...LOCALES.map((code) => [code, getAbsoluteUrl(HOME_PATHS[code])]), ["x-default", getAbsoluteUrl(HOME_PATHS[DEFAULT_LOCALE])]]) },
  }));
  const localizedEntries = localizedRoutes.map((route) => ({
    url: getAbsoluteUrl(getLocalizedPath(route)),
    lastModified: new Date(route.page.updatedAt),
    changeFrequency: "monthly" as const,
    priority: route.page.category === "video" ? 0.8 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        [...LOCALES, "x-default"].flatMap((locale) => {
          const targetLocale = locale === "x-default" ? "en" : locale;
          const translation = routesByPage.get(route.page.id)?.get(targetLocale);
          return translation ? [[locale, getAbsoluteUrl(getLocalizedPath(translation))]] : [];
        }),
      ),
    },
  }));
  return [...homeEntries, ...staticRoutes, ...localizedEntries];
}
