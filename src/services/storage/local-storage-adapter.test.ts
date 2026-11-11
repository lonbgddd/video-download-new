import { describe, expect, it } from "vitest";
import { sanitizeFilename } from "./local-storage-adapter";
describe("sanitizeFilename", () => {
  it("removes traversal and unsafe characters", () => expect(sanitizeFilename("../../xin chào<script>.mp4")).toBe("xin-chao-script.mp4"));
  it("provides a fallback", () => expect(sanitizeFilename("💥💥")).toBe("download"));
});
