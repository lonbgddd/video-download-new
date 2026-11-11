import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { extractorRegistry } from "@/services/extractor/extractor-registry";
import { rateLimitService } from "@/services/rate-limit/rate-limit-service";
import { validatePublicUrl } from "@/services/security/url-validator";

export const runtime = "nodejs";
const schema = z.object({ url: z.string().trim().min(8).max(2048) });

export async function POST(request: Request) {
  const requestId = randomUUID();
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    rateLimitService.check(`direct-link:${ip}`);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new AppError("INVALID_URL", "Invalid direct-link request");
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(30_000)]);
    const sourceUrl = await validatePublicUrl(parsed.data.url);
    const extractor = extractorRegistry.find(sourceUrl);
    const directUrl = await extractor.getDirectUrl(sourceUrl, signal);
    const validatedDirectUrl = await validatePublicUrl(directUrl);
    return ok({ directUrl: validatedDirectUrl.href });
  } catch (error) {
    return fail(error, requestId);
  }
}
