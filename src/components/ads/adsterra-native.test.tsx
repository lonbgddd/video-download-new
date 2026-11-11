import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/privacy/consent-store", () => ({
  useCookieConsent: () => ({ analytics: false, advertising: true }),
}));
import { AdsterraNative } from "./adsterra-native";

describe("AdsterraNative download modal placement", () => {
  it("loads the fixed 300x250 ad below the dialog content", async () => {
    render(
      <AdsterraNative
        enabled
        active
        placement="download-modal"
        label="Quảng cáo"
      />,
    );

    const slot = screen.getByLabelText("Quảng cáo");
    expect(slot).toHaveAttribute(
      "data-ad-placement",
      "download-modal",
    );
    expect(slot).toHaveAttribute("data-ad-state", "configured");

    const frame = await screen.findByTitle("Quảng cáo 300 × 250");
    expect(frame).toHaveAttribute("width", "300");
    expect(frame).toHaveAttribute("height", "250");
    expect(frame.getAttribute("srcdoc")).toContain(
      "8f54c5f9daa036076b1acff3dae9ba87",
    );
  });

  it("does not render the slot after the dialog closes", () => {
    render(
      <AdsterraNative
        enabled
        active={false}
        placement="download-modal"
        label="Quảng cáo"
      />,
    );

    expect(screen.queryByLabelText("Quảng cáo")).not.toBeInTheDocument();
  });
});
