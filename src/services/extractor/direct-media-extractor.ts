import path from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import type { MediaExtractor } from "./media-extractor";
import type { MediaFormat } from "@/types/media";
import { AppError } from "@/lib/errors";
import { env } from "@/config/env";
import { validatePublicUrl } from "@/services/security/url-validator";

const mediaExtensions = new Set([".mp4", ".webm", ".mov", ".m4v", ".mp3", ".m4a", ".ogg", ".wav"]);
const allowedMime = /^(video|audio)\//;
const fallbackMime: Record<string, string> = {
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav",
};

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
    let response = await safeFetch(url, { method: "HEAD", signal });
    const headMime = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    if (!response.ok || (!allowedMime.test(headMime ?? "") && headMime !== "application/octet-stream")) {
      response = await safeFetch(url, { method: "GET", headers: { Range: "bytes=0-0" }, signal });
    }
    if (!response.ok) throw new AppError("MEDIA_NOT_FOUND", "Media not found", 404);
    const responseMime = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ?? "";
    if (responseMime && !allowedMime.test(responseMime) && responseMime !== "application/octet-stream") {
      await response.body?.cancel().catch(() => undefined);
      throw new AppError("FORMAT_NOT_AVAILABLE", "Source returned a page instead of media");
    }
    const inferredMime = fallbackMime[path.extname(url.pathname).toLowerCase()];
    const mimeType = allowedMime.test(responseMime) ? responseMime : inferredMime;
    if (!mimeType) throw new AppError("UNSUPPORTED_PLATFORM", "Not a media URL");
    const contentRangeSize = response.headers.get("content-range")?.match(/\/(\d+)$/)?.[1];
    const fileSize = Number(contentRangeSize ?? response.headers.get("content-length") ?? 0) || undefined;
    if (response.body) await response.body.cancel().catch(() => undefined);
    if (fileSize && fileSize > env.MAX_FILE_SIZE) throw new AppError("FILE_TOO_LARGE", "Media exceeds configured size", 413);
    const rawName = decodeURIComponent(path.basename(url.pathname) || "media");
    return { title: rawName.replace(path.extname(rawName), "").replace(/[-_]+/g, " "), platform: "direct" as const, sourceUrl: url.href, formats: [this.makeFormat(url, mimeType, fileSize)] };
  }

  async getFormats(url: URL) { return [this.makeFormat(url)]; }

  async getDirectUrl(url: URL) { return url.href; }

  private makeFormat(url: URL, mimeType?: string, fileSize?: number): MediaFormat {
    const extension = path.extname(url.pathname).slice(1).toLowerCase() || "mp4";
    const type = extension.match(/^(mp3|m4a|ogg|wav)$/) ? "audio" : "video";
    return { id: `direct-${extension}`, type, label: type === "video" ? "Chất lượng gốc" : "Âm thanh gốc", extension, mimeType, fileSize, hasAudio: true };
  }

  async stream(url: URL, _format: MediaFormat, signal?: AbortSignal) {
    const response = await safeFetch(url, { signal });
    if (!response.ok || !response.body) throw new AppError("MEDIA_NOT_FOUND", "Download source unavailable");
    const mime = response.headers.get("content-type") ?? "";
    if (!allowedMime.test(mime) && mime.split(";", 1)[0].trim().toLowerCase() !== "application/octet-stream") throw new AppError("PROCESSING_FAILED", "Unexpected MIME type");
    const size = Number(response.headers.get("content-length"));
    if (Number.isFinite(size) && size > env.MAX_FILE_SIZE) throw new AppError("FILE_TOO_LARGE", "Media exceeds configured size");
    return { body: Readable.fromWeb(response.body as unknown as NodeReadableStream<Uint8Array>), mimeType: mime.split(";", 1)[0].trim().toLowerCase() };
  }
}
