import { spawn } from "node:child_process";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";

function run(binary: string, args: string[], signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { shell: false, stdio: ["ignore", "pipe", "pipe"], signal });
    let stdout = ""; let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; }); child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject); child.once("close", (code) => code === 0 ? resolve(stdout) : reject(new AppError("PROCESSING_FAILED", stderr.slice(-500) || `Media process exited ${code}`)));
  });
}

export class MediaProcessingService {
  mergeVideoAudio(video: string, audio: string, output: string, signal?: AbortSignal) { return run(env.FFMPEG_PATH, ["-nostdin", "-y", "-i", video, "-i", audio, "-c", "copy", output], signal); }
  extractAudio(input: string, output: string, signal?: AbortSignal) { return run(env.FFMPEG_PATH, ["-nostdin", "-y", "-i", input, "-vn", "-c:a", "copy", output], signal); }
  convertAudio(input: string, output: string, bitrate = 192, signal?: AbortSignal) { return run(env.FFMPEG_PATH, ["-nostdin", "-y", "-i", input, "-vn", "-b:a", `${bitrate}k`, output], signal); }
  convertContainer(input: string, output: string, signal?: AbortSignal) { return run(env.FFMPEG_PATH, ["-nostdin", "-y", "-i", input, "-c", "copy", output], signal); }
  async probeMedia(input: string, signal?: AbortSignal) { return JSON.parse(await run(env.FFPROBE_PATH, ["-v", "error", "-show_format", "-show_streams", "-of", "json", input], signal)) as unknown; }
}

export const mediaProcessingService = new MediaProcessingService();
