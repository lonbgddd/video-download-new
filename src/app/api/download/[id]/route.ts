import { Readable } from "node:stream";
import { fail } from "@/lib/api-response";
import { jobService } from "@/services/jobs/job-service";
import { storageService } from "@/services/storage/local-storage-adapter";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; const token = new URL(request.url).searchParams.get("token") ?? "";
    const job = jobService.resolveDownload(id, token);
    const stream = await storageService.openReadStream(job.id, job.fileName!);
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": job.mimeType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(job.fileName!)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) { return fail(error); }
}
