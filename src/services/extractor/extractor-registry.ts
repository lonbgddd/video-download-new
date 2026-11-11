import type { MediaExtractor } from "./media-extractor";
import { DirectMediaExtractor } from "./direct-media-extractor";
import { YtDlpExtractor } from "./yt-dlp-extractor";
import { AppError } from "@/lib/errors";

export class ExtractorRegistry {
  private readonly extractors: MediaExtractor[] = [new DirectMediaExtractor(), new YtDlpExtractor()];
  find(url: URL) {
    const extractor = this.extractors.find((candidate) => candidate.supports(url));
    if (!extractor) throw new AppError("UNSUPPORTED_PLATFORM", "Unsupported platform");
    return extractor;
  }
}

export const extractorRegistry = new ExtractorRegistry();
