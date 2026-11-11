import { PassThrough, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { MediaFormat, MediaMetadata } from "@/types/media";
import { extractorRegistry } from "@/services/extractor/extractor-registry";
import { sanitizeFilename } from "@/services/storage/local-storage-adapter";
import { validatePublicUrl } from "@/services/security/url-validator";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";
import type { MediaExtractor } from "@/services/extractor/media-extractor";

const mimeByExtension: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  mp3: "audio/mpeg", m4a: "audio/mp4", ogg: "audio/ogg", wav: "audio/wav",
  mkv: "video/x-matroska",
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
  private activeStreams = 0;
  private readonly waitingStreams: {
    resolve: (release: () => void) => void;
    reject: (error: Error) => void;
    signal?: AbortSignal;
    onAbort?: () => void;
  }[] = [];

  private acquire(signal?: AbortSignal) {
    if (signal?.aborted) throw new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian.");
    if (this.activeStreams < env.MAX_CONCURRENT_JOBS && this.waitingStreams.length === 0) {
      this.activeStreams += 1;
      return Promise.resolve(this.createRelease());
    }

    return new Promise<() => void>((resolve, reject) => {
      const waiter: (typeof this.waitingStreams)[number] = { resolve, reject, signal };
      waiter.onAbort = () => {
        const index = this.waitingStreams.indexOf(waiter);
        if (index !== -1) this.waitingStreams.splice(index, 1);
        reject(new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian."));
      };
      signal?.addEventListener("abort", waiter.onAbort, { once: true });
      this.waitingStreams.push(waiter);
    });
  }

  private createRelease() {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const next = this.waitingStreams.shift();
      if (next) {
        if (next.signal && next.onAbort) next.signal.removeEventListener("abort", next.onAbort);
        if (next.signal?.aborted) {
          next.reject(new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian."));
          this.createRelease()();
          return;
        }
        next.resolve(this.createRelease());
      } else {
        this.activeStreams -= 1;
      }
    };
  }

  async stream(media: MediaMetadata, format: MediaFormat, signal?: AbortSignal, sourceExtractor?: MediaExtractor) {
    const release = await this.acquire(signal);
    try {
      const url = await validatePublicUrl(media.sourceUrl);
      const extractor = sourceExtractor ?? extractorRegistry.find(url);
      const extracted = await extractor.stream(url, format, signal);
      const extension = sanitizeFilename((extracted.extension ?? format.extension).toLowerCase()).replace(/^\.+/, "") || "bin";
      const fileName = buildDownloadFilename(media.title, extension);
      const body = new PassThrough();
      let total = 0;
      const limiter = new Transform({ transform(chunk: Buffer, _encoding, callback) {
        total += chunk.length;
        if (total > env.MAX_FILE_SIZE) callback(new AppError("FILE_TOO_LARGE", "Media exceeds configured size"));
        else callback(null, chunk);
      }});
      body.once("close", release);
      body.on("error", (error) => {
        console.error(JSON.stringify({ level: "error", component: "download-stream", code: error instanceof AppError ? error.code : "STREAM_FAILED" }));
      });
      void pipeline(extracted.body, limiter, body, { signal }).catch((error: unknown) => {
        if (!body.destroyed) body.destroy(error instanceof Error ? error : new Error("Media stream failed"));
      });
      return { body, fileName, mimeType: extracted.mimeType ?? format.mimeType ?? mimeByExtension[extension] ?? "application/octet-stream" };
    } catch (error) {
      release();
      throw error;
    }
  }
}

export const downloadService = new DownloadService();
