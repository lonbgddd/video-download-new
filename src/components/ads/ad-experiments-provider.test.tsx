import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchAdExperimentConfig: vi.fn(),
  useCookieConsent: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  fetchAdExperimentConfig: mocks.fetchAdExperimentConfig,
}));

vi.mock("@/privacy/consent-store", () => ({
  useCookieConsent: mocks.useCookieConsent,
}));

import {
  AdExperimentsProvider,
  useAdExperiments,
} from "./ad-experiments-provider";

function ExperimentFlags() {
  return <output>{JSON.stringify(useAdExperiments())}</output>;
}

describe("AdExperimentsProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the current ad settings without analytics consent", () => {
    mocks.useCookieConsent.mockReturnValue({
      analytics: false,
      advertising: true,
    });

    render(
      <AdExperimentsProvider>
        <ExperimentFlags />
      </AdExperimentsProvider>,
    );

    expect(mocks.fetchAdExperimentConfig).not.toHaveBeenCalled();
    expect(JSON.parse(screen.getByRole("status").textContent ?? "{}")).toEqual({
      monetagVignette: true,
      monetagInPagePush: true,
      adcashInterstitial: true,
      adsterraPopunder: true,
      adsterraSocialBar: true,
      adsterraDisplay: true,
      adsterraNative: true,
      adsterraPopunderVariant: "existing",
      ready: true,
    });
  });

  it("applies the Firebase assignment after both consents are granted", async () => {
    mocks.useCookieConsent.mockReturnValue({
      analytics: true,
      advertising: true,
    });
    mocks.fetchAdExperimentConfig.mockResolvedValue({
      monetagVignette: false,
      monetagInPagePush: true,
      adcashInterstitial: true,
      adsterraPopunder: true,
      adsterraSocialBar: true,
      adsterraDisplay: true,
      adsterraNative: true,
      adsterraPopunderVariant: "provided",
    });

    render(
      <AdExperimentsProvider>
        <ExperimentFlags />
      </AdExperimentsProvider>,
    );

    await waitFor(() => {
      expect(JSON.parse(screen.getByRole("status").textContent ?? "{}")).toMatchObject({
        monetagVignette: false,
        adsterraPopunderVariant: "provided",
        ready: true,
      });
    });
    expect(mocks.fetchAdExperimentConfig).toHaveBeenCalledOnce();
  });
});
