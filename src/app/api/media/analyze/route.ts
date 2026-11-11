import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { mediaService } from "@/services/media/media-service";
import { rateLimitService } from "@/services/rate-limit/rate-limit-service";

const schema = z.object({ url: z.string().trim().min(8).max(2048) });

export async function POST(request: Request) {
  const requestId = randomUUID(); const started = Date.now();
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    rateLimitService.check(`analyze:${ip}`);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new AppError("INVALID_URL", "Invalid request body");
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]);
    const media = await mediaService.analyze(parsed.data.url, signal);
    console.info(JSON.stringify({ level: "info", requestId, platform: media.platform, status: "success", processingTime: Date.now() - started }));
    return ok({ media });
  } catch (error) { return fail(error, requestId); }
}
