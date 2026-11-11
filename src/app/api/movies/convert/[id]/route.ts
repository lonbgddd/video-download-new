import { Readable } from "node:stream";
import { hlsConverter } from "@/services/movies/hls-converter";
import { fail } from "@/lib/api-response";

export const runtime = "nodejs";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const file = hlsConverter.download(id);
    const abort = () => file.body.destroy();
    request.signal.addEventListener("abort", abort, { once: true });
    file.body.once("close", () => request.signal.removeEventListener("abort", abort));
    if (request.signal.aborted) abort();
    return new Response(Readable.toWeb(file.body) as unknown as ReadableStream, { headers: {
      "Content-Type": "video/mp4", "Content-Length": String(file.size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) { return fail(error); }
}
