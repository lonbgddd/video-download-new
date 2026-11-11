import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { movieService } from "@/services/movies/movie-service";
import { rateLimitService } from "@/services/rate-limit/rate-limit-service";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    rateLimitService.check(`movies:${ip}`);
    const parsed = z.object({ url: z.string().trim().url().max(2048) }).safeParse(await request.json());
    if (!parsed.success) throw new AppError("INVALID_URL", "Invalid movie URL");
    return ok(await movieService.analyze(parsed.data.url, AbortSignal.any([request.signal, AbortSignal.timeout(30_000)])));
  } catch (error) { return fail(error); }
}
