import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/security/url-validator", () => ({
  validatePublicUrl: vi.fn(async (input: string) => new URL(input)),
}));

import { DirectMediaExtractor } from "./direct-media-extractor";

describe("DirectMediaExtractor", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("falls back to a ranged GET when the source rejects HEAD", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 405 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([0]), {
        status: 206,
        headers: {
          "content-type": "video/mp4",
          "content-range": "bytes 0-0/123456",
        },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const metadata = await new DirectMediaExtractor().getMetadata(new URL("https://cdn.example/video.mp4"));

    expect(metadata.formats?.[0]).toMatchObject({ mimeType: "video/mp4", fileSize: 123456 });
    expect(fetchMock).toHaveBeenNthCalledWith(1, expect.any(URL), expect.objectContaining({ method: "HEAD" }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.any(URL), expect.objectContaining({
      method: "GET",
      headers: { Range: "bytes=0-0" },
    }));
  });

  it("accepts an octet-stream response for a known media extension", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, {
      status: 200,
      headers: { "content-type": "application/octet-stream", "content-length": "42" },
    })));

    const metadata = await new DirectMediaExtractor().getMetadata(new URL("https://cdn.example/video.webm"));

    expect(metadata.formats?.[0]).toMatchObject({ mimeType: "video/webm", fileSize: 42 });
  });

  it("streams media bytes from the validated source", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(Buffer.from("media-bytes"), {
      status: 200,
      headers: { "content-type": "video/mp4" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const extractor = new DirectMediaExtractor();
    const format = { id: "direct-mp4", type: "video", label: "Original", extension: "mp4", hasAudio: true } as const;

    const result = await extractor.stream(new URL("https://cdn.example/video.mp4"), format);
    const chunks: Buffer[] = [];
    for await (const chunk of result.body) chunks.push(Buffer.from(chunk));

    expect(Buffer.concat(chunks).toString()).toBe("media-bytes");
    expect(result.mimeType).toBe("video/mp4");
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
