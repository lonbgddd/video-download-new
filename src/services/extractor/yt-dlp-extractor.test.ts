import { describe, expect, it } from "vitest";
import type { MediaFormat } from "@/types/media";
import { buildYtDlpDownloadArgs } from "./yt-dlp-extractor";

const url = new URL("https://www.youtube.com/watch?v=test123");

describe("buildYtDlpDownloadArgs", () => {
  it("enables the Node runtime and merges audio for a video-only YouTube format", () => {
    const format: MediaFormat = {
      id: "137", type: "video", label: "1080p", extension: "mp4", hasAudio: false,
    };

    const args = buildYtDlpDownloadArgs(format, "/tmp/video.mp4", url);

    expect(args).toEqual(expect.arrayContaining(["--js-runtimes", "node", "--merge-output-format", "mp4"]));
    expect(args[args.indexOf("--format") + 1]).toBe("137+bestaudio[ext=m4a]/137+bestaudio/137");
    expect(args.slice(-2)).toEqual(["--", url.href]);
  });

  it("keeps a format that already contains audio unchanged", () => {
    const format: MediaFormat = {
      id: "22", type: "video", label: "720p", extension: "mp4", hasAudio: true,
    };

    const args = buildYtDlpDownloadArgs(format, "/tmp/video.mp4", url);

    expect(args[args.indexOf("--format") + 1]).toBe("22");
    expect(args).not.toContain("--merge-output-format");
  });
});
