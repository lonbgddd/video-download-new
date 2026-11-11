import { randomUUID } from "node:crypto";
import { MoviePageExtractor } from "@/services/extractor/movie-page-extractor";
import { DirectMediaExtractor } from "@/services/extractor/direct-media-extractor";
import { validatePublicUrl } from "@/services/security/url-validator";
import { AppError } from "@/lib/errors";
import type { MediaMetadata } from "@/types/media";

// Separate from social-video analysis/jobs. Tickets retain the verified source
// for ten minutes, so download does not rescan a page with changing player URLs.
class MovieService {
  private tickets = new Map<string, MediaMetadata>();
  async analyze(input: string, signal: AbortSignal) {
    for (const [key, media] of this.tickets) if (media.expiresAt <= Date.now()) this.tickets.delete(key);
    const url = await validatePublicUrl(input);
    const direct = new DirectMediaExtractor();
    const directKind = /\.m3u8$/i.test(url.pathname) ? "hls" as const : "mp4" as const;
    const found = /\.(?:mp4|m3u8)$/i.test(url.pathname)
      ? { title: decodeURIComponent(url.pathname.split("/").pop() || "Movie"), sources: directKind === "mp4" ? [url.href] : [], candidates: [{ url: url.href, kind: directKind, pageUrl: url.href }], hasHls: directKind === "hls", incomplete: false, blockedPlayers: 0, pagesScanned: 0, signal }
      : await new MoviePageExtractor().discover(url, signal);
    const sources: { id: string; label: string; fileSize?: number; downloadUrl: string }[] = [];
    const verified = new Set<string>();
    let probeIncomplete = false;
    for (const source of found.sources) {
      if (signal.aborted) { probeIncomplete = true; break; }
      try {
        const metadata = await direct.getMetadata(await validatePublicUrl(source), AbortSignal.any([signal, AbortSignal.timeout(3_000)]));
        const format = metadata.formats[0];
        if (format.mimeType !== "video/mp4") continue;
        // Player endpoints may have .php/no extension despite returning MP4.
        format.extension = "mp4";
        format.type = "video";
        const id = randomUUID();
        const media: MediaMetadata = { ...metadata, title: found.title, id, expiresAt: Date.now() + 600_000 };
        if (this.tickets.size >= 500) this.tickets.delete(this.tickets.keys().next().value!);
        this.tickets.set(id, media);
        verified.add(source);
        sources.push({ id, label: `MP4 · ${sources.length + 1}`, fileSize: format.fileSize, downloadUrl: `/api/movies/download/${id}` });
      } catch { if (signal.aborted) { probeIncomplete = true; break; } }
    }
    const discovered = found.candidates.map((item) => {
      let downloadUrl: string | undefined;
      if (item.kind === "hls") {
        const id = randomUUID();
        if (this.tickets.size >= 500) this.tickets.delete(this.tickets.keys().next().value!);
        this.tickets.set(id, { id, title: found.title, sourceUrl: item.url, platform: "other", expiresAt: Date.now() + 600_000,
          formats: [{ id: "original-hls", type: "video", label: "HLS playlist", extension: "m3u8", mimeType: "application/vnd.apple.mpegurl", hasAudio: false }] });
        downloadUrl = `/api/movies/download/${id}`;
      }
      return { ...item, verified: verified.has(item.url), downloadUrl, conversionId: downloadUrl?.split("/").pop() };
    });
    return { title: found.title, sources, discovered,
      incomplete: found.incomplete || probeIncomplete, blockedPlayers: found.blockedPlayers, pagesScanned: found.pagesScanned,
      status: sources.length ? "ready" : found.hasHls ? "hls_only" : "no_mp4" };
  }
  get(id: string) {
    const media = this.tickets.get(id);
    if (!media || media.expiresAt <= Date.now()) {
      this.tickets.delete(id);
      throw new AppError("MEDIA_NOT_FOUND", "Analyze movie again", 404);
    }
    return media;
  }
}
const globalMovies = globalThis as typeof globalThis & { __movieService?: MovieService };
export const movieService = globalMovies.__movieService ??= new MovieService();
