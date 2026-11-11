import { describe, expect, it } from "vitest";
import type { MediaFormat } from "@/types/media";
import { buildYtDlpDirectUrlArgs, buildYtDlpStreamArgs, getPreferredYtDlpAudioFormat } from "./yt-dlp-extractor";

const url = new URL("https://www.youtube.com/watch?v=test123");

describe("Yt-DLP streaming", () => {
  it("writes media to stdout without creating an output file", () => {
    const format: MediaFormat = {
      id: "137", type: "video", label: "1080p", extension: "mp4", hasAudio: false,
    };

    const args = buildYtDlpStreamArgs(format.id, url);

    expect(args).toEqual(expect.arrayContaining(["--js-runtimes", "node", "--no-cache-dir", "--output", "-"]));
    expect(args[args.indexOf("--format") + 1]).toBe("137");
    expect(args.slice(-2)).toEqual(["--", url.href]);
    expect(getPreferredYtDlpAudioFormat(format)).toBe("bestaudio[ext=m4a]");
  });

  it("selects compatible audio for WebM video-only formats", () => {
    const format: MediaFormat = {
      id: "303", type: "video", label: "1080p", extension: "webm", hasAudio: false,
    };
    expect(getPreferredYtDlpAudioFormat(format)).toBe("bestaudio[ext=webm]");
  });

  it("extracts a single public A/V stream URL without downloading the media", () => {
    const args = buildYtDlpDirectUrlArgs(url);

    expect(args).toEqual(expect.arrayContaining(["--get-url", "--no-cache-dir"]));
    expect(args[args.indexOf("--format") + 1]).toBe("best[vcodec!=none][acodec!=none]");
    expect(args.slice(-2)).toEqual(["--", url.href]);
    expect(args).not.toContain("--output");
  });
});
