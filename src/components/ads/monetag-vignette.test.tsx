import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  default: ({
    src,
    "data-zone": zone,
  }: {
    src: string;
    "data-zone": string;
  }) => <div data-testid="monetag-script" data-src={src} data-zone={zone} />,
}));

import { MonetagVignette } from "./monetag-vignette";

describe("MonetagVignette", () => {
  it("does not mount before the dialog is active", () => {
    render(<MonetagVignette enabled active={false} />);
    expect(screen.queryByTestId("monetag-script")).not.toBeInTheDocument();
  });

  it("mounts the configured Vignette zone with an active dialog", () => {
    render(<MonetagVignette enabled active />);
    const script = screen.getByTestId("monetag-script");
    expect(script).toHaveAttribute("data-zone", "12238810");
    expect(script).toHaveAttribute(
      "data-src",
      "https://n6wxm.com/vignette.min.js",
    );
  });
});
