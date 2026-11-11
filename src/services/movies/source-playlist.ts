import { validatePublicUrl } from "@/services/security/url-validator";
import { AppError } from "@/lib/errors";

// Download the original manifest, not the media segments it references.
export async function readSourcePlaylist(input: string, signal: AbortSignal) {
  let target = input;
  for (let redirects = 0; redirects <= 3; redirects++) {
    const url = await validatePublicUrl(target);
    const response = await fetch(url, { redirect: "manual", signal });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) break;
      target = new URL(location, url).href;
      continue;
    }
    if (!response.ok || !response.body) {
      await response.body?.cancel();
      throw new AppError("MEDIA_NOT_FOUND", "Playlist is unavailable", 404);
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2 * 1024 * 1024) throw new AppError("FILE_TOO_LARGE", "Playlist too large");
        chunks.push(value);
      }
    } finally { await reader.cancel().catch(() => undefined); }
    const body = Buffer.concat(chunks);
    if (!body.toString("utf8").replace(/^\uFEFF/, "").trimStart().startsWith("#EXTM3U")) throw new AppError("FORMAT_NOT_AVAILABLE", "Not an HLS playlist");
    return body;
  }
  throw new AppError("INVALID_URL", "Too many redirects");
}
