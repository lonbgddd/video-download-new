import { Readable } from "node:stream";
import { env } from "@/config/env";
import { fail } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { jobService } from "@/services/jobs/job-service";
import { mediaService } from "@/services/media/media-service";
import { downloadService } from "@/services/media/download-service";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();
  const abort = () => controller.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  try {
    const { id } = await context.params; const token = new URL(request.url).searchParams.get("token") ?? "";
    const job = jobService.resolveDownload(id, token);
    const media = mediaService.get(job.mediaId);
    const format = media.formats.find((item) => item.id === job.formatId);
    if (!format) throw new AppError("FORMAT_NOT_AVAILABLE", "Download format is no longer available");
    timeout = setTimeout(abort, env.DOWNLOAD_TIMEOUT);
    const prepared = await downloadService.stream(media, format, controller.signal);
    prepared.body.once("close", () => {
      if (timeout) clearTimeout(timeout);
      request.signal.removeEventListener("abort", abort);
    });
    return new Response(Readable.toWeb(prepared.body) as unknown as ReadableStream, {
      headers: {
        "Content-Type": prepared.mimeType,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(prepared.fileName)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (timeout) clearTimeout(timeout);
    request.signal.removeEventListener("abort", abort);
    return fail(error);
  }
}
