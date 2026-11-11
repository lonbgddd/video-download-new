import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { movieService } from "@/services/movies/movie-service";
import { hlsConverter } from "@/services/movies/hls-converter";
import { rateLimitService } from "@/services/rate-limit/rate-limit-service";

export const runtime = "nodejs";
export const maxDuration = 600;
export async function POST(request: Request) {
  try {
    rateLimitService.check(`movie-convert:${request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local"}`);
    const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json());
    if (!parsed.success) throw new AppError("INVALID_URL", "Invalid conversion ticket");
    const media = movieService.get(parsed.data.id);
    if (media.formats[0]?.id !== "original-hls") throw new AppError("FORMAT_NOT_AVAILABLE", "Expected HLS source");
    return ok(await hlsConverter.prepare(media.sourceUrl, media.title, request.signal));
  } catch (error) {
    if (error instanceof AppError && error.code === "FORMAT_NOT_AVAILABLE") {
      return Response.json({ success: false, error: { code: error.code, message: error.message } }, { status: error.status });
    }
    return fail(error);
  }
}
