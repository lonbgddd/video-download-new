import path from "node:path";
import { stat } from "node:fs/promises";
import type { MediaFormat, MediaMetadata } from "@/types/media";
import { extractorRegistry } from "@/services/extractor/extractor-registry";
import { storageService, sanitizeFilename } from "@/services/storage/local-storage-adapter";
import { validatePublicUrl } from "@/services/security/url-validator";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";

export class DownloadService {
  async prepare(media: MediaMetadata, format: MediaFormat, jobId: string, signal?: AbortSignal) {
    const directory = await storageService.createJobDirectory(jobId);
    const fileName = sanitizeFilename(`${media.title}.${format.extension}`);
    const filePath = path.join(directory, fileName);
    const url = await validatePublicUrl(media.sourceUrl);
    const extractor = extractorRegistry.find(url);
    if (!extractor.download) throw new AppError("PROCESSING_FAILED", "Extractor cannot download this media");
    await extractor.download(url, format.id, filePath, signal);
    const info = await stat(filePath);
    if (info.size > env.MAX_FILE_SIZE) throw new AppError("FILE_TOO_LARGE", "File too large");
    return { fileName, filePath, size: info.size, mimeType: format.mimeType ?? (format.type === "audio" ? "audio/mpeg" : "video/mp4") };
  }
}

export const downloadService = new DownloadService();
