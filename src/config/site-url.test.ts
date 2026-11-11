import { afterEach, describe, expect, it, vi } from "vitest";
import { getSiteUrl, PRODUCTION_SITE_URL } from "./site-url";
import { GET } from "@/app/sitemaps.xml/route";

describe("site URL configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the production domain instead of a localhost APP_URL in production", () => {
    expect(getSiteUrl("http://localhost:3000", "production").origin).toBe(PRODUCTION_SITE_URL);
  });

  it("uses the production domain when APP_URL is the wildcard bind address", () => {
    expect(getSiteUrl("https://0.0.0.0:8080", "production").origin).toBe(PRODUCTION_SITE_URL);
  });

  it("preserves an explicitly configured production domain", () => {
    expect(getSiteUrl("https://example.com", "production").origin).toBe("https://example.com");
  });

  it("keeps localhost as the development default", () => {
    expect(getSiteUrl(undefined, "development").origin).toBe("http://localhost:3000");
  });

  it("redirects the plural sitemap alias to the canonical production sitemap", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const response = GET();
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`${PRODUCTION_SITE_URL}/sitemap.xml`);
  });
});
