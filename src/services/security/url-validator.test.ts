import { describe, expect, it, vi } from "vitest";

vi.mock("node:dns/promises", () => ({ lookup: vi.fn(async (hostname: string) => hostname === "public.example" ? [{ address: "93.184.216.34", family: 4 }] : [{ address: "192.168.1.20", family: 4 }]) }));

import { isPrivateIp, validatePublicUrl } from "./url-validator";

describe("isPrivateIp", () => {
  it.each(["127.0.0.1", "10.0.0.1", "172.16.1.2", "192.168.1.1", "169.254.169.254", "::1", "fd00::1"])("blocks %s", (value) => expect(isPrivateIp(value)).toBe(true));
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("allows %s", (value) => expect(isPrivateIp(value)).toBe(false));
  it("allows a hostname resolving only to a public IP", async () => expect((await validatePublicUrl("https://public.example/video.mp4")).hostname).toBe("public.example"));
  it("blocks a hostname resolving to a private IP", async () => expect(validatePublicUrl("https://rebind.example/video.mp4")).rejects.toMatchObject({ code: "INVALID_URL" }));
  it("blocks localhost before DNS", async () => expect(validatePublicUrl("http://localhost/file.mp4")).rejects.toMatchObject({ code: "INVALID_URL" }));
});
