import { describe, expect, it } from "vitest";
import { getLocalizedRoutes, LANDING_PAGES, LOCALES } from "@/config/i18n.config";
import sitemap from "@/app/sitemap";
import { generateLandingMetadata, getLocalizedPath } from "./metadata";

describe("localized SEO metadata", () => {
  it("generates canonical and hreflang URLs for every translation", () => {
    const routes = getLocalizedRoutes();
    expect(routes).toHaveLength(503 * 7);
    expect(LOCALES).toHaveLength(7);
    expect(LANDING_PAGES).toHaveLength(503);
    expect(new Set(routes.map((route) => `${route.locale}/${route.topic}/${route.slug}`)).size).toBe(routes.length);

    for (const route of [routes[0], routes[1], routes[2], routes[3], routes[4], routes[5], routes[6], routes.at(-1)!]) {
      const metadata = generateLandingMetadata(route);
      const alternates = metadata.alternates;
      expect(String(alternates?.canonical)).toContain(getLocalizedPath(route));
      expect(alternates?.languages).toMatchObject({
        en: expect.stringContaining("/en/"),
        vi: expect.stringContaining("/vi/"),
        es: expect.stringContaining("/es/"),
        ja: expect.stringContaining("/ja/"),
        fr: expect.stringContaining("/fr/"),
        pt: expect.stringContaining("/pt/"),
        ko: expect.stringContaining("/ko/"),
        "x-default": expect.stringContaining("/en/"),
      });
      expect(metadata.openGraph?.locale).toBeTruthy();
      expect(metadata.twitter).toBeDefined();
    }
  });

  it("includes each localized route and translated sitemap alternates", () => {
    const entries = sitemap();
    const localizedEntries = entries.filter((entry) => /\/(en|vi|es|ja|fr|pt|ko)\//.test(entry.url));

    expect(entries).toHaveLength(3526);
    expect(localizedEntries).toHaveLength(3521);
    for (const entry of localizedEntries) {
      expect(entry.alternates?.languages).toMatchObject({
        en: expect.stringContaining("/en/"),
        vi: expect.stringContaining("/vi/"),
        es: expect.stringContaining("/es/"),
        ja: expect.stringContaining("/ja/"),
        fr: expect.stringContaining("/fr/"),
        pt: expect.stringContaining("/pt/"),
        ko: expect.stringContaining("/ko/"),
        "x-default": expect.stringContaining("/en/"),
      });
    }
  });
});
