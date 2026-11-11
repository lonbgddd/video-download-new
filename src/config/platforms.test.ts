import { describe, expect, it } from "vitest";
import { detectPlatform } from "./platforms";
describe("detectPlatform", () => {
  it("detects known nested domains", () => expect(detectPlatform("www.youtube.com")).toBe("youtube"));
  it("does not accept lookalike domains", () => expect(detectPlatform("youtube.com.evil.test")).toBe("other"));
});
