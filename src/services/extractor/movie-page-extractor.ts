import { parseMoviePage, type MovieCandidate } from "@/services/movies/parse-movie-page";
import { AppError } from "@/lib/errors";
import { validatePublicUrl } from "@/services/security/url-validator";

const MAX_HTML_BYTES = 2 * 1024 * 1024;

// Only inspect public HTML. Never execute page scripts or forward user cookies.
async function readPage(input: URL, signal: AbortSignal) {
  let url = input;
  for (let redirects = 0; redirects <= 3; redirects++) {
    url = await validatePublicUrl(url.href);
    const response = await fetch(url, { redirect: "manual", signal, headers: { Accept: "text/html" } });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel();
      const location = response.headers.get("location");
      if (!location) break;
      url = new URL(location, url);
      continue;
    }
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html") || !response.body) {
      await response.body?.cancel();
      throw new AppError("FORMAT_NOT_AVAILABLE", "No public HTML page");
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let size = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > MAX_HTML_BYTES) throw new AppError("PROCESSING_FAILED", "Page too large");
        html += decoder.decode(chunk.value, { stream: true });
      }
      return { html: html + decoder.decode(), url };
    } finally { await reader.cancel().catch(() => undefined); }
  }
  throw new AppError("INVALID_URL", "Too many redirects");
}

export class MoviePageExtractor {
  async discover(url: URL, signal?: AbortSignal) {
    const boundedSignal = AbortSignal.any([AbortSignal.timeout(25_000), ...(signal ? [signal] : [])]);
    const queue = [{ url, depth: 0 }];
    const visited = new Set<string>();
    const candidates = new Map<string, MovieCandidate>();
    let title = url.hostname;
    let incomplete = false;
    let blockedPlayers = 0;
    while (queue.length && visited.size < 8 && !boundedSignal.aborted) {
      const next = queue.shift()!;
      if (visited.has(next.url.href)) continue;
      visited.add(next.url.href);
      try {
        const page = await readPage(next.url, AbortSignal.any([boundedSignal, AbortSignal.timeout(6_000)]));
        const parsed = parseMoviePage(page.html, page.url);
        if (next.depth === 0) title = parsed.title;
        for (const source of parsed.sources) {
          if (candidates.size >= 100) { incomplete = true; break; }
          try { await validatePublicUrl(source.url); candidates.set(source.url, source); } catch { /* Ignore non-public destinations. */ }
        }
        if (next.depth < 2) {
          for (const link of parsed.embeds) {
            if (!visited.has(link) && queue.length < 40) queue.push({ url: new URL(link), depth: next.depth + 1 });
          }
        } else if (parsed.embeds.length) incomplete = true;
      } catch (error) {
        if (next.depth === 0) throw boundedSignal.aborted ? new AppError("TIMEOUT", "Movie page timed out") : error;
        blockedPlayers++;
      }
    }
    if (signal?.aborted) throw new AppError("TIMEOUT", "Movie analysis cancelled");
    incomplete ||= queue.length > 0 || boundedSignal.aborted || blockedPlayers > 0;
    return { title, sources: [...candidates.values()].filter((item) => item.kind === "mp4").map((item) => item.url),
      candidates: [...candidates.values()], hasHls: [...candidates.values()].some((item) => item.kind === "hls"),
      incomplete, blockedPlayers, pagesScanned: visited.size, signal: signal ?? boundedSignal };
  }
}
