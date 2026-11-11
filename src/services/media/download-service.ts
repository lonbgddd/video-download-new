import path from "node:path";
import { stat } from "node:fs/promises";
import type { MediaFormat, MediaMetadata } from "@/types/media";
import { extractorRegistry } from "@/services/extractor/extractor-registry";
import { storageService, sanitizeFilename } from "@/services/storage/local-storage-adapter";
import { validatePublicUrl } from "@/services/security/url-validator";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";

const mimeByExtension: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg", wav: "audio/wav",
};

export function buildDownloadFilename(title: string, rawExtension: string) {
  const extension = sanitizeFilename(rawExtension.toLowerCase()).replace(/^\.+/, "") || "bin";
  const safeTitle = sanitizeFilename(title)
    .replace(/\.[a-z0-9]{1,8}$/i, "")
    .replace(/[ .-]+$/, "")
    .slice(0, Math.max(1, 119 - extension.length));
  return sanitizeFilename(`${safeTitle}.${extension}`);
}

export class DownloadService {
  async prepare(media: MediaMetadata, format: MediaFormat, jobId: string, signal?: AbortSignal) {
    const directory = await storageService.createJobDirectory(jobId);
    const extension = sanitizeFilename(format.extension.toLowerCase()).replace(/^\.+/, "") || "bin";
    const fileName = buildDownloadFilename(media.title, extension);
    const filePath = path.join(directory, fileName);
    const url = await validatePublicUrl(media.sourceUrl);
    const extractor = extractorRegistry.find(url);
    if (!extractor.download) throw new AppError("PROCESSING_FAILED", "Extractor cannot download this media");
    await extractor.download(url, format, filePath, signal);
    const info = await stat(filePath);
    if (info.size > env.MAX_FILE_SIZE) throw new AppError("FILE_TOO_LARGE", "File too large");
    return { fileName, filePath, size: info.size, mimeType: format.mimeType ?? mimeByExtension[extension] ?? "application/octet-stream" };
  }
}

export const downloadService = new DownloadService();
