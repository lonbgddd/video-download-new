import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { jobService } from "@/services/jobs/job-service";
import { rateLimitService } from "@/services/rate-limit/rate-limit-service";

const schema = z.object({ mediaId: z.string().min(8).max(80), formatId: z.string().min(1).max(160), type: z.enum(["video", "audio", "thumbnail"]) });

export async function POST(request: Request) {
  const requestId = randomUUID();
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    rateLimitService.check(`download:${ip}`);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) throw new AppError("FORMAT_NOT_AVAILABLE", "Invalid download request");
    const job = jobService.create(parsed.data.mediaId, parsed.data.formatId, parsed.data.type);
    return ok({ jobId: job.id, status: job.status }, 202);
  } catch (error) { return fail(error, requestId); }
}
