import { describe, expect, it } from "vitest";
import { sanitizeFilename } from "@/services/storage/local-storage-adapter";
import { buildDownloadFilename } from "./download-service";

describe("buildDownloadFilename", () => {
  it("stays stable when storage sanitizes a YouTube title again", () => {
    const fileName = buildDownloadFilename(
      "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)",
      "mp4",
    );

    expect(fileName).toBe("Rick-Astley-Never-Gonna-Give-You-Up-Official-Video-4K-Remaster.mp4");
    expect(sanitizeFilename(fileName)).toBe(fileName);
  });

  it("preserves the extension for very long titles", () => {
    const fileName = buildDownloadFilename("a".repeat(300), "webm");

    expect(fileName).toHaveLength(120);
    expect(fileName).toMatch(/\.webm$/);
  });
});
