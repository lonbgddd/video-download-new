import { spawn } from "node:child_process";
import { PassThrough, type Readable, type Writable } from "node:stream";
import type { MediaExtractor } from "./media-extractor";
import type { MediaFormat, PlatformId } from "@/types/media";
import { detectPlatform } from "@/config/platforms";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";

type YtDlpFormat = { format_id: string; ext?: string; width?: number; height?: number; fps?: number; vcodec?: string; acodec?: string; filesize?: number; filesize_approx?: number; tbr?: number };
type YtDlpJson = { id: string; title: string; thumbnail?: string; duration?: number; uploader?: string; formats?: YtDlpFormat[]; is_live?: boolean };

function run(binary: string, args: string[], signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ["ignore", "pipe", "pipe"], signal, shell: false });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; if (stdout.length > 10_000_000) child.kill(); });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-20_000); });
    child.once("error", (error: NodeJS.ErrnoException) => reject(new AppError(error.code === "ENOENT" ? "EXTRACTOR_UNAVAILABLE" : "PROCESSING_FAILED", error.code === "ENOENT" ? `Không tìm thấy chương trình tại ${binary}` : error.message)));
    child.once("close", (code) => code === 0 ? resolve(stdout) : reject(new AppError("PROCESSING_FAILED", stderr.slice(-600) || `Extractor exited ${code}`)));
  });
}

const baseArgs = ["--no-playlist", "--no-warnings", "--js-runtimes", "node"];

export function buildYtDlpStreamArgs(formatId: string, url: URL) {
  return [
    ...baseArgs,
    "--no-cache-dir",
    "--max-filesize", String(env.MAX_FILE_SIZE),
    "--format", formatId,
    "--output", "-",
    "--no-part",
    "--no-progress",
    "--",
    url.href,
  ];
}

export function getPreferredYtDlpAudioFormat(format: MediaFormat) {
  return format.extension === "webm" ? "bestaudio[ext=webm]" : "bestaudio[ext=m4a]";
}

export function buildYtDlpDirectUrlArgs(url: URL) {
  return [
    ...baseArgs,
    "--no-cache-dir",
    "--format", "best",
    "--get-url",
    "--",
    url.href,
  ];
}

function waitForFirstData(stream: Readable) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      stream.off("readable", onReadable);
      stream.off("end", onEnd);
      stream.off("error", onError);
    };
    const onReadable = () => {
      if (stream.readableLength === 0) return;
      cleanup();
      resolve();
    };
    const onEnd = () => { cleanup(); reject(new AppError("PROCESSING_FAILED", "Media source returned an empty stream")); };
    const onError = (error: Error) => { cleanup(); reject(error); };
    stream.on("readable", onReadable);
    stream.once("end", onEnd);
    stream.once("error", onError);
    onReadable();
  });
}

function processError(binary: string, error?: NodeJS.ErrnoException) {
  if (error?.code === "ENOENT") return new AppError("EXTRACTOR_UNAVAILABLE", `Không tìm thấy chương trình tại ${binary}`);
  return new AppError("PROCESSING_FAILED", "Không thể truyền dữ liệu media.");
}

function terminate(child: ReturnType<typeof spawn>) {
  if (child.exitCode === null && child.signalCode === null) child.kill("SIGTERM");
}

async function startYtDlpStream(args: string[], signal?: AbortSignal) {
  const child = spawn(env.YT_DLP_PATH, args, { stdio: ["ignore", "pipe", "ignore"], signal });
  const body = new PassThrough();
  child.stdout.pipe(body, { end: false });
  child.once("error", (error: NodeJS.ErrnoException) => body.destroy(signal?.aborted ? new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian.") : processError(env.YT_DLP_PATH, error)));
  child.once("close", (code) => {
    if (code === 0) body.end();
    else body.destroy(signal?.aborted ? new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian.") : processError(env.YT_DLP_PATH));
  });
  const stop = () => { terminate(child); body.destroy(new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian.")); };
  signal?.addEventListener("abort", stop, { once: true });
  body.once("close", () => { signal?.removeEventListener("abort", stop); terminate(child); });
  try {
    await waitForFirstData(body);
    return body;
  } catch (error) {
    terminate(child);
    throw error;
  }
}

function normalizeFormat(format: YtDlpFormat): MediaFormat | null {
  const hasVideo = Boolean(format.vcodec && format.vcodec !== "none");
  const hasAudio = Boolean(format.acodec && format.acodec !== "none");
  if (!hasVideo && !hasAudio) return null;
  return {
    id: format.format_id,
    type: hasVideo ? "video" : "audio",
    label: hasVideo ? (format.height ? `${format.height}p${format.height >= 2160 ? " / 4K" : ""}` : "Video") : (format.tbr ? `${Math.round(format.tbr)} kbps` : "Âm thanh gốc"),
    extension: format.ext ?? "mp4", width: format.width, height: format.height, fps: format.fps,
    codec: hasVideo ? format.vcodec : format.acodec, bitrate: format.tbr ? Math.round(format.tbr) : undefined,
    fileSize: format.filesize ?? format.filesize_approx, hasAudio,
  };
}

export class YtDlpExtractor implements MediaExtractor {
  readonly name = "yt-dlp";
  supports(url: URL) { return detectPlatform(url.hostname) !== "other" && detectPlatform(url.hostname) !== "direct"; }
  private async read(url: URL, signal?: AbortSignal, enforceDurationLimit = true): Promise<YtDlpJson> {
    const raw = await run(env.YT_DLP_PATH, ["--dump-single-json", ...baseArgs, "--skip-download", "--", url.href], signal);
    const data = JSON.parse(raw) as YtDlpJson;
    if (data.is_live) throw new AppError("RESTRICTED_MEDIA", "Live streams are not supported");
    if (enforceDurationLimit && (data.duration ?? 0) > env.MAX_MEDIA_DURATION) throw new AppError("MEDIA_TOO_LONG", "Media exceeds duration limit");
    return data;
  }
  async getMetadata(url: URL, signal?: AbortSignal) {
    const data = await this.read(url, signal);
    return { title: data.title, thumbnail: data.thumbnail, duration: data.duration, author: data.uploader, platform: detectPlatform(url.hostname) as PlatformId, sourceUrl: url.href, formats: (data.formats ?? []).map(normalizeFormat).filter((item): item is MediaFormat => Boolean(item)).filter((item) => !item.fileSize || item.fileSize <= env.MAX_FILE_SIZE) };
  }
  async getFormats(url: URL, signal?: AbortSignal) { return (await this.getMetadata(url, signal)).formats ?? []; }

  async getDirectUrl(url: URL, signal?: AbortSignal) {
    const output = await run(env.YT_DLP_PATH, buildYtDlpDirectUrlArgs(url), signal);
    const links = output.trim().split(/\r?\n/);
    if (links.length !== 1) throw new AppError("FORMAT_NOT_AVAILABLE", "No single direct video stream is available");
    try {
      return new URL(links[0]).href;
    } catch {
      throw new AppError("PROCESSING_FAILED", "The extractor returned an invalid direct URL");
    }
  }

  async stream(url: URL, format: MediaFormat, signal?: AbortSignal) {
    if (format.type !== "video" || format.hasAudio) {
      return {
        body: await startYtDlpStream(buildYtDlpStreamArgs(format.id, url), signal),
        mimeType: format.mimeType,
        extension: format.extension,
      };
    }

    const audioFormat = getPreferredYtDlpAudioFormat(format);
    const video = spawn(env.YT_DLP_PATH, buildYtDlpStreamArgs(format.id, url), { stdio: ["ignore", "pipe", "ignore"], signal });
    const audio = spawn(env.YT_DLP_PATH, buildYtDlpStreamArgs(audioFormat, url), { stdio: ["ignore", "pipe", "ignore"], signal });
    const ffmpeg = spawn(env.FFMPEG_PATH, [
      "-hide_banner", "-loglevel", "error",
      "-i", "pipe:0", "-i", "pipe:3",
      "-map", "0:v:0", "-map", "1:a:0", "-c", "copy", "-f", "matroska", "pipe:1",
    ], { stdio: ["pipe", "pipe", "ignore", "pipe"], signal });
    const body = new PassThrough();
    const audioInput = ffmpeg.stdio[3] as Writable | null;
    if (!ffmpeg.stdin || !ffmpeg.stdout || !audioInput) throw new AppError("PROCESSING_FAILED", "Không thể khởi động luồng ghép media.");
    video.stdout.pipe(ffmpeg.stdin);
    audio.stdout.pipe(audioInput);
    ffmpeg.stdout.pipe(body, { end: false });

    const failStream = (error: NodeJS.ErrnoException | undefined, binary: string) => {
      body.destroy(signal?.aborted ? new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian.") : processError(binary, error));
      terminate(video);
      terminate(audio);
      terminate(ffmpeg);
    };
    video.once("error", (error: NodeJS.ErrnoException) => failStream(error, env.YT_DLP_PATH));
    audio.once("error", (error: NodeJS.ErrnoException) => failStream(error, env.YT_DLP_PATH));
    ffmpeg.once("error", (error: NodeJS.ErrnoException) => failStream(error, env.FFMPEG_PATH));
    const sourceFailed = (code: number | null) => { if (code !== 0) failStream(undefined, env.YT_DLP_PATH); };
    video.once("close", sourceFailed);
    audio.once("close", sourceFailed);
    ffmpeg.once("close", (code) => {
      if (code === 0) body.end();
      else body.destroy(signal?.aborted ? new AppError("TIMEOUT", "Quá trình xử lý đã hết thời gian.") : processError(env.FFMPEG_PATH));
    });
    const stop = () => failStream(undefined, env.FFMPEG_PATH);
    signal?.addEventListener("abort", stop, { once: true });
    body.once("close", () => {
      signal?.removeEventListener("abort", stop);
      terminate(video);
      terminate(audio);
      terminate(ffmpeg);
    });
    try {
      await waitForFirstData(body);
      return { body, mimeType: "video/x-matroska", extension: "mkv" };
    } catch (error) {
      terminate(video);
      terminate(audio);
      terminate(ffmpeg);
      throw error;
    }
  }
}
