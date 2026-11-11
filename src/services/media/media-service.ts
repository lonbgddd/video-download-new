import { createHash } from "node:crypto";
import { extractorRegistry } from "@/services/extractor/extractor-registry";
import { validatePublicUrl } from "@/services/security/url-validator";
import type { MediaMetadata } from "@/types/media";
import { AppError } from "@/lib/errors";

const CACHE_TTL = 10 * 60 * 1000;

class MediaService {
  private readonly byId = new Map<string, MediaMetadata>();
  private readonly byUrl = new Map<string, MediaMetadata>();

  async analyze(input: string, signal?: AbortSignal) {
    const url = await validatePublicUrl(input);
    const cached = this.byUrl.get(url.href);
    if (cached && cached.expiresAt > Date.now()) return cached;
    const extractor = extractorRegistry.find(url);
    const extracted = await extractor.getMetadata(url, signal);
    const formats = extracted.formats?.length ? extracted.formats : await extractor.getFormats(url, signal);
    if (!formats.length) throw new AppError("FORMAT_NOT_AVAILABLE", "No downloadable formats found");
    const id = createHash("sha256").update(`${url.href}:${Date.now()}`).digest("hex").slice(0, 24);
    const media: MediaMetadata = { ...extracted, formats, id, expiresAt: Date.now() + CACHE_TTL };
    this.byId.set(id, media); this.byUrl.set(url.href, media);
    return media;
  }

  get(id: string) {
    const media = this.byId.get(id);
    if (!media || media.expiresAt <= Date.now()) {
      if (media) this.byId.delete(id);
      throw new AppError("MEDIA_NOT_FOUND", "Analysis expired", 404);
    }
    return media;
  }
}

const globalMedia = globalThis as typeof globalThis & { __mediaService?: MediaService };
export const mediaService = globalMedia.__mediaService ??= new MediaService();
