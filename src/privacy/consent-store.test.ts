import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  document.cookie = "vd_cookie_consent=; Max-Age=0; Path=/";
  Object.defineProperty(navigator, "globalPrivacyControl", {
    configurable: true,
    value: false,
  });
  vi.resetModules();
});

describe("cookie consent storage", () => {
  it("stores an explicit category choice in a first-party cookie", async () => {
    const { saveCookieConsent } = await import("./consent-store");
    const consent = saveCookieConsent({ analytics: true, advertising: false });

    expect(consent).toMatchObject({
      necessary: true,
      analytics: true,
      advertising: false,
    });
    expect(document.cookie).toContain("vd_cookie_consent=");
  });

  it("honors Global Privacy Control for advertising", async () => {
    Object.defineProperty(navigator, "globalPrivacyControl", {
      configurable: true,
      value: true,
    });
    const { saveCookieConsent } = await import("./consent-store");

    expect(
      saveCookieConsent({ analytics: true, advertising: true }).advertising,
    ).toBe(false);
  });
});
