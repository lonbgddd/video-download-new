import { Readable } from "node:stream";
import { env } from "@/config/env";
import { fail } from "@/lib/api-response";
import { movieService } from "@/services/movies/movie-service";
import { downloadService } from "@/services/media/download-service";
import { DirectMediaExtractor } from "@/services/extractor/direct-media-extractor";
import { readSourcePlaylist } from "@/services/movies/source-playlist";
import { buildDownloadFilename } from "@/services/media/download-service";

export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const media = movieService.get(id);
    if (media.formats[0].id === "original-hls") {
      const body = await readSourcePlaylist(media.sourceUrl, AbortSignal.any([request.signal, AbortSignal.timeout(15_000)]));
      return new Response(new Uint8Array(body), { headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(buildDownloadFilename(media.title, "m3u8"))}`,
        "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
      } });
    }
    const prepared = await downloadService.stream(media, media.formats[0], AbortSignal.any([request.signal, AbortSignal.timeout(env.DOWNLOAD_TIMEOUT)]), new DirectMediaExtractor());
    return new Response(Readable.toWeb(prepared.body) as unknown as ReadableStream, { headers: {
      "Content-Type": prepared.mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(prepared.fileName)}`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) { return fail(error); }
}
