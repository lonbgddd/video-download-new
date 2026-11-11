import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, writeFile, rm, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { Parser, type Manifest } from "m3u8-parser";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";
import { validatePublicUrl } from "@/services/security/url-validator";
import { buildDownloadFilename } from "@/services/media/download-service";

// All remote requests happen here, never inside FFmpeg. Redirects and each
// segment/init URL pass the same public-network validation as the page URL.
async function fetchBytes(input: string, signal: AbortSignal, limit: number) {
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
      throw new AppError("MEDIA_NOT_FOUND", "HLS resource unavailable");
    }
    const reader = response.body.getReader();
    let size = 0;
    const chunks: Uint8Array[] = [];
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > limit) throw new AppError("FILE_TOO_LARGE", "HLS size limit exceeded");
        chunks.push(chunk.value);
      }
    } finally { await reader.cancel().catch(() => undefined); }
    return { body: Buffer.concat(chunks), url };
  }
  throw new AppError("INVALID_URL", "HLS redirect limit exceeded");
}

async function playlist(input: string, signal: AbortSignal, depth = 0): Promise<{ manifest: Manifest; url: URL }> {
  if (depth > 3) throw new AppError("FORMAT_NOT_AVAILABLE", "Nested HLS limit exceeded");
  const result = await fetchBytes(input, signal, 2 * 1024 * 1024);
  const text = result.body.toString("utf8").replace(/^\uFEFF/, "");
  if (!text.trimStart().startsWith("#EXTM3U")) throw new AppError("FORMAT_NOT_AVAILABLE", "Invalid HLS playlist");
  const parser = new Parser(); parser.push(text); parser.end();
  const manifest = parser.manifest;
  if (manifest.playlists?.length) {
    const variant = [...manifest.playlists].sort((a, b) => (b.attributes.BANDWIDTH ?? 0) - (a.attributes.BANDWIDTH ?? 0))[0];
    const audio = variant.attributes.AUDIO && manifest.mediaGroups?.AUDIO?.[variant.attributes.AUDIO];
    if (audio && Object.values(audio).some((item) => item.uri)) throw new AppError("FORMAT_NOT_AVAILABLE", "Separate audio playlists are not supported yet");
    return playlist(new URL(variant.uri, result.url).href, signal, depth + 1);
  }
  if (!manifest.endList || !manifest.segments?.length || manifest.segments.length > 10000) throw new AppError("FORMAT_NOT_AVAILABLE", "Only finite HLS VOD is supported");
  if (manifest.segments.some((segment) => (segment.key && segment.key.method !== "NONE") || segment.byterange || segment.map?.byterange)) throw new AppError("FORMAT_NOT_AVAILABLE", "Encrypted or byte-range HLS is not supported");
  return { manifest, url: result.url };
}

async function ffmpeg(directory: string, signal: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(env.FFMPEG_PATH, ["-nostdin", "-hide_banner", "-loglevel", "error", "-protocol_whitelist", "file", "-allowed_extensions", "ALL", "-i", "input.m3u8", "-map", "0:v:0", "-map", "0:a:0?", "-c", "copy", "-movflags", "+faststart", "-fs", String(env.MAX_FILE_SIZE + 1), "-y", "output.mp4"], { cwd: directory, stdio: ["ignore", "ignore", "ignore"], signal, shell: false });
    let forcedKill: ReturnType<typeof setTimeout> | undefined;
    const stop = () => { child.kill("SIGTERM"); forcedKill = setTimeout(() => child.kill("SIGKILL"), 2000); forcedKill.unref(); };
    signal.addEventListener("abort", stop, { once: true });
    let processError: Error | undefined;
    child.once("error", (error: NodeJS.ErrnoException) => { processError = new AppError(error.code === "ENOENT" ? "EXTRACTOR_UNAVAILABLE" : "PROCESSING_FAILED", "FFmpeg unavailable or failed"); });
    child.once("close", (code) => {
      if (forcedKill) clearTimeout(forcedKill);
      signal.removeEventListener("abort", stop);
      if (signal.aborted) reject(new AppError("TIMEOUT", "Conversion cancelled or timed out"));
      else if (processError) reject(processError);
      else if (code !== 0) reject(new AppError("PROCESSING_FAILED", "Cannot remux source codecs into MP4"));
      else resolve();
    });
  });
}

class HlsConverter {
  private active = 0;
  private files = new Map<string, { directory: string; name: string; size: number; expires: number; timer: ReturnType<typeof setTimeout> }>();
  async prepare(url: string, title: string, requestSignal: AbortSignal) {
    if (this.active >= env.MAX_CONCURRENT_JOBS || this.files.size + this.active >= 5) throw new AppError("RATE_LIMIT", "Conversion capacity reached", 429);
    this.active++;
    let directory: string | undefined;
    const signal = AbortSignal.any([requestSignal, AbortSignal.timeout(env.DOWNLOAD_TIMEOUT)]);
    try {
      const { manifest, url: base } = await playlist(url, signal);
      await mkdir(env.TEMP_DIRECTORY, { recursive: true });
      directory = await mkdtemp(path.join(env.TEMP_DIRECTORY, "hls-"));
      let total = 0;
      const lines = ["#EXTM3U", "#EXT-X-VERSION:7", `#EXT-X-TARGETDURATION:${Math.ceil(Math.max(...manifest.segments.map((item) => item.duration)))}`, "#EXT-X-MEDIA-SEQUENCE:0", "#EXT-X-PLAYLIST-TYPE:VOD"];
      const initFiles = new Map<string, string>();
      for (const [index, segment] of manifest.segments.entries()) {
        if (!Number.isFinite(segment.duration) || segment.duration <= 0) throw new AppError("FORMAT_NOT_AVAILABLE", "Invalid segment duration");
        if (segment.discontinuity) lines.push("#EXT-X-DISCONTINUITY");
        if (segment.map) {
          const initUrl = new URL(segment.map.uri, base).href;
          let name = initFiles.get(initUrl);
          if (!name) {
            name = `init-${initFiles.size}.mp4`;
            const init = await fetchBytes(initUrl, signal, Math.min(32 * 1024 * 1024, env.MAX_FILE_SIZE - total));
            total += init.body.length;
            await writeFile(path.join(directory, name), init.body, { signal });
            initFiles.set(initUrl, name);
          }
          lines.push(`#EXT-X-MAP:URI="${name}"`);
        }
        const data = await fetchBytes(new URL(segment.uri, base).href, signal, Math.min(64 * 1024 * 1024, env.MAX_FILE_SIZE - total));
        total += data.body.length;
        const name = `segment-${index}.${segment.map ? "m4s" : "ts"}`;
        await writeFile(path.join(directory, name), data.body, { signal });
        lines.push(`#EXTINF:${segment.duration},`, name);
      }
      lines.push("#EXT-X-ENDLIST");
      await writeFile(path.join(directory, "input.m3u8"), lines.join("\n"), { signal });
      await ffmpeg(directory, signal);
      const output = await stat(path.join(directory, "output.mp4"));
      if (!output.size || output.size >= env.MAX_FILE_SIZE) throw new AppError("FILE_TOO_LARGE", "MP4 output exceeds limit");
      signal.throwIfAborted();
      const id = randomUUID();
      const finishedDirectory = directory;
      const timer = setTimeout(() => { this.files.delete(id); void rm(finishedDirectory, { recursive: true, force: true }); }, 600_000);
      timer.unref();
      this.files.set(id, { directory, name: buildDownloadFilename(title, "mp4"), size: output.size, expires: Date.now() + 600_000, timer });
      directory = undefined;
      return { downloadUrl: `/api/movies/convert/${id}`, fileSize: output.size };
    } catch (error) {
      if (signal.aborted) throw new AppError("TIMEOUT", "Conversion timed out or cancelled");
      throw error;
    } finally {
      this.active--;
      if (directory) await rm(directory, { recursive: true, force: true });
    }
  }
  download(id: string) {
    const file = this.files.get(id);
    if (!file || file.expires <= Date.now()) throw new AppError("MEDIA_NOT_FOUND", "MP4 expired", 404);
    this.files.delete(id); clearTimeout(file.timer);
    const body = createReadStream(path.join(file.directory, "output.mp4"));
    body.once("close", () => { void rm(file.directory, { recursive: true, force: true }); });
    return { body, name: file.name, size: file.size };
  }
}
const globalConverter = globalThis as typeof globalThis & { __hlsConverter?: HlsConverter };
export const hlsConverter = globalConverter.__hlsConverter ??= new HlsConverter();
