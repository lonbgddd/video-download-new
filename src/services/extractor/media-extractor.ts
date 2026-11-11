import type { MediaFormat, MediaMetadata, PlatformId } from "@/types/media";

export interface ExtractedMetadata extends Omit<MediaMetadata, "id" | "expiresAt" | "formats"> { formats?: MediaFormat[] }

export interface MediaExtractor {
  readonly name: string;
  supports(url: URL): boolean;
  getMetadata(url: URL, signal?: AbortSignal): Promise<ExtractedMetadata>;
  getFormats(url: URL, signal?: AbortSignal): Promise<MediaFormat[]>;
  download?(url: URL, formatId: string, outputPath: string, signal?: AbortSignal): Promise<void>;
}

export type ExtractorPlatform = PlatformId;
