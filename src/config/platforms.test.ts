import { describe, expect, it } from "vitest";
import { detectPlatform } from "./platforms";
describe("detectPlatform", () => {
  it("detects known nested domains", () => expect(detectPlatform("www.youtube.com")).toBe("youtube"));
  it.each([
    ["www.reddit.com", "reddit"],
    ["v.redd.it", "reddit"],
    ["soundcloud.com", "soundcloud"],
    ["www.pinterest.com", "pinterest"],
    ["pin.it", "pinterest"],
    ["www.bilibili.com", "bilibili"],
    ["b23.tv", "bilibili"],
  ] as const)("detects %s as %s", (hostname, platform) => {
    expect(detectPlatform(hostname)).toBe(platform);
  });
  it("does not accept lookalike domains", () => expect(detectPlatform("youtube.com.evil.test")).toBe("other"));
  it("does not accept lookalike domains for newly supported platforms", () => {
    expect(detectPlatform("reddit.com.evil.test")).toBe("other");
    expect(detectPlatform("soundcloud.com.evil.test")).toBe("other");
    expect(detectPlatform("pinterest.com.evil.test")).toBe("other");
    expect(detectPlatform("bilibili.com.evil.test")).toBe("other");
  });
});
