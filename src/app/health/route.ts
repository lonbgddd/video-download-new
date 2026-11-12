import { access, constants, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { env } from "@/config/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function canRun(binary: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(binary, ["-version"], { stdio: "ignore" });
    child.once("error", () => resolve(false));
    child.once("close", (code) => resolve(code === 0));
  });
}

export async function GET() {
  let tempWritable = false;
  try { await mkdir(env.TEMP_DIRECTORY, { recursive: true }); await access(env.TEMP_DIRECTORY, constants.W_OK); tempWritable = true; } catch { /* Report below. */ }
  const ffmpeg = await canRun(env.FFMPEG_PATH);
  const healthy = tempWritable && ffmpeg;
  return Response.json({ ok: healthy, service: "video-downloader", checks: { tempWritable, ffmpeg } }, { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
