import { cleanup, render, waitFor } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/script", async () => {
  const React = await import("react");
  return {
    default: function MockScript({ onReady }: { onReady?: () => void }) {
      React.useEffect(() => onReady?.(), [onReady]);
      return null;
    },
  };
});

import {
  AdcashInterstitial,
  requestAdcashInterstitial,
} from "./adcash-interstitial";

afterEach(() => {
  cleanup();
  delete window.aclib;
});

describe("requestAdcashInterstitial", () => {
  it("dispatches a browser event carrying the requested placement", () => {
    const listener = vi.fn();
    window.addEventListener(
      "video-downloader:adcash-interstitial-request",
      listener,
    );

    requestAdcashInterstitial("download-dialog");

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toBe(
      "download-dialog",
    );
    window.removeEventListener(
      "video-downloader:adcash-interstitial-request",
      listener,
    );
  });

  it("runs the configured interstitial once inside the throttle window", async () => {
    const runInterstitial = vi.fn();
    window.aclib = { runInterstitial };
    render(createElement(AdcashInterstitial, { enabled: true }));

    await waitFor(() => {
      requestAdcashInterstitial("analyze-submit");
      expect(runInterstitial).toHaveBeenCalledWith({ zoneId: "12435318" });
    });

    requestAdcashInterstitial("download-submit");
    expect(runInterstitial).toHaveBeenCalledTimes(1);
  });
});
