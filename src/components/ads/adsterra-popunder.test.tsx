import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useCookieConsent: vi.fn(),
}));

vi.mock("@/privacy/consent-store", () => ({
  useCookieConsent: mocks.useCookieConsent,
}));

import { ADSTERRA_POPUNDER_SCRIPT_URL } from "@/config/ad-networks";
import { ADSTERRA_POPUNDER_STORAGE_KEY } from "@/config/ad-networks";
import { AdsterraPopunder } from "./adsterra-popunder";

describe("AdsterraPopunder", () => {
  beforeEach(() => {
    mocks.useCookieConsent.mockReturnValue({
      analytics: true,
      advertising: true,
    });
    localStorage.removeItem(ADSTERRA_POPUNDER_STORAGE_KEY);
  });

  afterEach(() => {
    cleanup();
    document
      .querySelectorAll('script[data-ad-network="adsterra-popunder"]')
      .forEach((script) => script.remove());
  });

  it("uses the current external popunder tag for the control variant", () => {
    render(<AdsterraPopunder enabled variant="existing" />);

    const script = document.querySelector<HTMLScriptElement>(
      'script[data-ad-network="adsterra-popunder"]',
    );
    expect(script?.src).toBe(ADSTERRA_POPUNDER_SCRIPT_URL);
  });

  it("uses the supplied popunder tag for the experiment variant", () => {
    render(<AdsterraPopunder enabled variant="provided" />);

    const script = document.querySelector<HTMLScriptElement>(
      'script[data-ad-network="adsterra-popunder"]',
    );
    expect(script?.src).toBe("");
    expect(script?.textContent).toContain(
      'b9013ced2cd9a76dc8401e50b9433de1',
    );
    expect(script?.textContent).toContain("d3d3LmRpc3BsYXl2ZXJ0aXNpbmcuY29t");
    expect(script?.dataset.cfasync).toBe("false");
  });

  it("does not load either popunder variant without ad consent", async () => {
    mocks.useCookieConsent.mockReturnValue({
      analytics: false,
      advertising: false,
    });

    render(<AdsterraPopunder enabled variant="provided" />);

    expect(
      document.querySelector(
        'script[data-ad-network="adsterra-popunder"]',
      ),
    ).toBeNull();
  });
});
