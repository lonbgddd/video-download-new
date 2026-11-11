import type { Readable } from "node:stream";
import type { MediaFormat, MediaMetadata, PlatformId } from "@/types/media";

export interface ExtractedMetadata extends Omit<MediaMetadata, "id" | "expiresAt" | "formats"> { formats?: MediaFormat[] }
export interface ExtractedMediaStream { body: Readable; mimeType?: string; extension?: string }

export interface MediaExtractor {
  readonly name: string;
  supports(url: URL): boolean;
  getMetadata(url: URL, signal?: AbortSignal): Promise<ExtractedMetadata>;
  getFormats(url: URL, signal?: AbortSignal): Promise<MediaFormat[]>;
  getDirectUrl(url: URL, signal?: AbortSignal): Promise<string>;
  stream(url: URL, format: MediaFormat, signal?: AbortSignal): Promise<ExtractedMediaStream>;
}

export type ExtractorPlatform = PlatformId;
