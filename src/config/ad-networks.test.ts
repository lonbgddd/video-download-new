import { describe, expect, it } from "vitest";
import {
  ADCASH_INTERSTITIAL_ZONE_ID,
  MONETAG_IN_PAGE_PUSH_SCRIPT_URL,
  MONETAG_IN_PAGE_PUSH_ZONE_ID,
  MONETAG_VIGNETTE_SCRIPT_URL,
  MONETAG_VIGNETTE_ZONE_ID,
} from "./ad-networks";

describe("production ad zones", () => {
  it("uses the configured Monetag Vignette zone", () => {
    expect(MONETAG_VIGNETTE_ZONE_ID).toBe("12238810");
    expect(MONETAG_VIGNETTE_SCRIPT_URL).toBe(
      "https://n6wxm.com/vignette.min.js",
    );
  });

  it("uses the configured Monetag In-Page Push zone", () => {
    expect(MONETAG_IN_PAGE_PUSH_ZONE_ID).toBe("12238840");
    expect(MONETAG_IN_PAGE_PUSH_SCRIPT_URL).toBe(
      "https://nap5k.com/tag.min.js",
    );
  });

  it("uses the configured Adcash Interstitial zone", () => {
    expect(ADCASH_INTERSTITIAL_ZONE_ID).toBe("12435318");
  });
});
