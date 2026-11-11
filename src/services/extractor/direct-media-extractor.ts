import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable, Transform } from "node:stream";
import type { MediaExtractor } from "./media-extractor";
import type { MediaFormat } from "@/types/media";
import { AppError } from "@/lib/errors";
import { env } from "@/config/env";
import { validatePublicUrl } from "@/services/security/url-validator";

const mediaExtensions = new Set([".mp4", ".webm", ".mov", ".m4v", ".mp3", ".m4a", ".ogg", ".wav"]);
const allowedMime = /^(video|audio)\//;

async function safeFetch(url: URL, init: RequestInit, redirects = 0): Promise<Response> {
  if (redirects > 3) throw new AppError("INVALID_URL", "Too many redirects");
  const validated = await validatePublicUrl(url.href);
  const response = await fetch(validated, { ...init, redirect: "manual" });
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (!location) throw new AppError("MEDIA_NOT_FOUND", "Invalid redirect");
    return safeFetch(new URL(location, validated), init, redirects + 1);
  }
  return response;
}

export class DirectMediaExtractor implements MediaExtractor {
  readonly name = "direct-media";
  supports(url: URL) { return mediaExtensions.has(path.extname(url.pathname).toLowerCase()); }

  async getMetadata(url: URL, signal?: AbortSignal) {
    const response = await safeFetch(url, { method: "HEAD", signal });
    if (!response.ok) throw new AppError("MEDIA_NOT_FOUND", "Media not found", 404);
    const mimeType = response.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
    if (!allowedMime.test(mimeType)) throw new AppError("UNSUPPORTED_PLATFORM", "Not a media URL");
    const fileSize = Number(response.headers.get("content-length") ?? 0) || undefined;
    if (fileSize && fileSize > env.MAX_FILE_SIZE) throw new AppError("FILE_TOO_LARGE", "Media exceeds configured size", 413);
    const rawName = decodeURIComponent(path.basename(url.pathname) || "media");
    return { title: rawName.replace(path.extname(rawName), "").replace(/[-_]+/g, " "), platform: "direct" as const, sourceUrl: url.href, formats: [this.makeFormat(url, mimeType, fileSize)] };
  }

  async getFormats(url: URL) { return [this.makeFormat(url)]; }

  private makeFormat(url: URL, mimeType?: string, fileSize?: number): MediaFormat {
    const extension = path.extname(url.pathname).slice(1).toLowerCase() || "mp4";
    const type = extension.match(/^(mp3|m4a|ogg|wav)$/) ? "audio" : "video";
    return { id: `direct-${extension}`, type, label: type === "video" ? "Chất lượng gốc" : "Âm thanh gốc", extension, mimeType, fileSize, hasAudio: true };
  }

  async download(url: URL, _formatId: string, outputPath: string, signal?: AbortSignal) {
    const response = await safeFetch(url, { signal });
    if (!response.ok || !response.body) throw new AppError("MEDIA_NOT_FOUND", "Download source unavailable");
    const mime = response.headers.get("content-type") ?? "";
    if (!allowedMime.test(mime)) throw new AppError("PROCESSING_FAILED", "Unexpected MIME type");
    let total = 0;
    const limiter = new Transform({ transform(chunk, _encoding, callback) {
      total += chunk.length;
      if (total > env.MAX_FILE_SIZE) callback(new AppError("FILE_TOO_LARGE", "Media exceeds configured size"));
      else callback(null, chunk);
    }});
    await pipeline(Readable.fromWeb(response.body as never), limiter, createWriteStream(outputPath, { flags: "wx", mode: 0o600 }));
  }
}
