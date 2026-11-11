import { describe, expect, it } from "vitest";
import {
  ADCASH_INTERSTITIAL_ZONE_ID,
  getAdsterraDisplayUnit,
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

  it("maps every fixed display banner to the requested placement", () => {
    expect(getAdsterraDisplayUnit("above-header")).toMatchObject({
      key: "98e35b0413ed2eff342f2f8566bedf6a",
      width: 468,
      height: 60,
    });
    expect(getAdsterraDisplayUnit("side-left")).toMatchObject({
      key: "58dc13d1a3ef5c59e24c0db82e73cae7",
      width: 160,
      height: 300,
    });
    expect(getAdsterraDisplayUnit("side-right")).toEqual(
      getAdsterraDisplayUnit("side-left"),
    );
    expect(getAdsterraDisplayUnit("near-input")).toMatchObject({
      key: "4566b019213ecce8b1b81d34c8b78ffe",
      width: 320,
      height: 50,
    });
    expect(getAdsterraDisplayUnit("download-modal")).toMatchObject({
      key: "8f54c5f9daa036076b1acff3dae9ba87",
      width: 300,
      height: 250,
    });
  });
});
