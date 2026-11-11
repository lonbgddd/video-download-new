import { describe, expect, it } from "vitest";
import { getSiteUrl, PRODUCTION_SITE_URL } from "./site-url";

describe("site URL configuration", () => {
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
});
