import { Readable } from "node:stream";
import { fail } from "@/lib/api-response";
import { AppError } from "@/lib/errors";
import { mediaService } from "@/services/media/media-service";
import { validatePublicUrl } from "@/services/security/url-validator";

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id") ?? ""; const media = mediaService.get(id);
    if (!media.thumbnail) throw new AppError("MEDIA_NOT_FOUND", "Thumbnail not available", 404);
    const url = await validatePublicUrl(media.thumbnail); const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(15_000) });
    const type = response.headers.get("content-type") ?? ""; const length = Number(response.headers.get("content-length") ?? 0);
    if (!response.ok || !response.body || !type.startsWith("image/") || length > 10_000_000) throw new AppError("MEDIA_NOT_FOUND", "Invalid thumbnail", 404);
    return new Response(Readable.toWeb(Readable.fromWeb(response.body as never)) as ReadableStream, { headers: { "Content-Type": type, "Cache-Control": "private, max-age=600", "Content-Disposition": `inline; filename="thumbnail.${type.split("/")[1] ?? "jpg"}"`, "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return fail(error); }
}
