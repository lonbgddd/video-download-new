import { spawn } from "node:child_process";
import type { MediaExtractor } from "./media-extractor";
import type { MediaFormat, PlatformId } from "@/types/media";
import { detectPlatform } from "@/config/platforms";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";

type YtDlpFormat = { format_id: string; ext?: string; width?: number; height?: number; fps?: number; vcodec?: string; acodec?: string; filesize?: number; filesize_approx?: number; tbr?: number };
type YtDlpJson = { id: string; title: string; thumbnail?: string; duration?: number; uploader?: string; formats?: YtDlpFormat[]; is_live?: boolean };

function run(binary: string, args: string[], signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"], signal, shell: false });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; if (stdout.length > 10_000_000) child.kill(); });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", (error) => reject(error));
    child.once("close", (code) => code === 0 ? resolve(stdout) : reject(new AppError("PROCESSING_FAILED", stderr.slice(-600) || `Extractor exited ${code}`)));
  });
}

function normalizeFormat(format: YtDlpFormat): MediaFormat | null {
  const hasVideo = Boolean(format.vcodec && format.vcodec !== "none");
  const hasAudio = Boolean(format.acodec && format.acodec !== "none");
  if (!hasVideo && !hasAudio) return null;
  return {
    id: format.format_id,
    type: hasVideo ? "video" : "audio",
    label: hasVideo ? (format.height ? `${format.height}p${format.height >= 2160 ? " / 4K" : ""}` : "Video") : (format.tbr ? `${Math.round(format.tbr)} kbps` : "Âm thanh gốc"),
    extension: format.ext ?? "mp4", width: format.width, height: format.height, fps: format.fps,
    codec: hasVideo ? format.vcodec : format.acodec, bitrate: format.tbr ? Math.round(format.tbr) : undefined,
    fileSize: format.filesize ?? format.filesize_approx, hasAudio,
  };
}

export class YtDlpExtractor implements MediaExtractor {
  readonly name = "yt-dlp";
  supports(url: URL) { return detectPlatform(url.hostname) !== "other" && detectPlatform(url.hostname) !== "direct"; }
  private async read(url: URL, signal?: AbortSignal): Promise<YtDlpJson> {
    const raw = await run(env.YT_DLP_PATH, ["--dump-single-json", "--no-playlist", "--skip-download", "--no-warnings", "--", url.href], signal);
    const data = JSON.parse(raw) as YtDlpJson;
    if (data.is_live) throw new AppError("RESTRICTED_MEDIA", "Live streams are not supported");
    if ((data.duration ?? 0) > env.MAX_MEDIA_DURATION) throw new AppError("MEDIA_TOO_LONG", "Media exceeds duration limit");
    return data;
  }
  async getMetadata(url: URL, signal?: AbortSignal) {
    const data = await this.read(url, signal);
    return { title: data.title, thumbnail: data.thumbnail, duration: data.duration, author: data.uploader, platform: detectPlatform(url.hostname) as PlatformId, sourceUrl: url.href, formats: (data.formats ?? []).map(normalizeFormat).filter((item): item is MediaFormat => Boolean(item)).filter((item) => !item.fileSize || item.fileSize <= env.MAX_FILE_SIZE) };
  }
  async getFormats(url: URL, signal?: AbortSignal) { return (await this.getMetadata(url, signal)).formats ?? []; }
  async download(url: URL, formatId: string, outputPath: string, signal?: AbortSignal) {
    await run(env.YT_DLP_PATH, ["--no-playlist", "--max-filesize", String(env.MAX_FILE_SIZE), "--format", formatId, "--output", outputPath, "--", url.href], signal);
  }
}
