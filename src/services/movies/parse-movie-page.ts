import { load } from "cheerio/slim";

export type MovieCandidate = { url: string; kind: "mp4" | "hls" | "dash"; pageUrl: string };
const normalize = (value: string) => value
  .replace(/\\\\/g, "\\")
  .replace(/\\\//g, "/")
  .replace(/\\"/g, '"')
  .replace(/\\u0026/gi, "&")
  .replace(/&amp;/gi, "&");

// Parse markup with a DOM library; never evaluate third-party JavaScript.
export function parseMoviePage(html: string, pageUrl: URL) {
  const $ = load(html);
  const sources = new Map<string, MovieCandidate>();
  const embeds = new Set<string>();
  let base = pageUrl;
  try { base = new URL($("base[href]").first().attr("href") || pageUrl.href, pageUrl); } catch { /* Use response URL. */ }
  const resolve = (raw: string) => {
    try {
      const url = new URL(normalize(raw).trim(), base);
      if (!/^https?:$/.test(url.protocol) || url.username || url.password || raw.includes("${")) return;
      url.hash = "";
      return url;
    } catch { return; }
  };
  const collect = (raw: string, mime = "") => {
    const url = resolve(raw);
    if (!url || sources.size >= 100) return;
    if (/(?:^|\/)(?:1s_blank|blank|placeholder)\.mp4$/i.test(url.pathname)) return;
    const kind = /\.m3u8$/i.test(url.pathname) || /mpegurl/i.test(mime) ? "hls"
      : /\.mpd$/i.test(url.pathname) || /dash\+xml/i.test(mime) ? "dash"
      : /\.mp4$/i.test(url.pathname) || /video\/mp4/i.test(mime) ? "mp4" : null;
    if (kind) sources.set(url.href, { url: url.href, kind, pageUrl: pageUrl.href });
  };
  const embed = (raw: string) => { const url = resolve(raw); if (url && embeds.size < 20) embeds.add(url.href); };
  $("video, source, a, [data-link], [data-src], [data-file], [data-video], meta, iframe, embed, object").each((_, element) => {
    const item = $(element);
    const mime = item.attr("type") || item.attr("data-type") || "";
    for (const name of ["src", "href", "data-link", "data-src", "data-file", "data-video", "content"]) {
      const value = item.attr(name);
      if (value) collect(value, mime);
    }
    if (item.is("iframe, embed")) embed(item.attr("src") || item.attr("data-src") || "");
    if (item.is("object")) embed(item.attr("data") || "");
    if (/embed|iframe/i.test(mime)) embed(item.attr("data-link") || item.attr("data-src") || "");
  });
  // JSON-LD / hydration data: walk nested objects instead of guessing property order.
  const walk = (value: unknown, depth = 0) => {
    if (depth > 30) return;
    if (typeof value === "string") collect(value);
    else if (Array.isArray(value)) value.forEach((child) => walk(child, depth + 1));
    else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      // Hydration often contains every episode. Only expose the requested one.
      const episode = pageUrl.pathname.split("/").filter(Boolean).pop();
      if (typeof record.slug === "string" && typeof record.link === "string" && record.slug !== episode) return;
      const mime = typeof record.type === "string" ? record.type : typeof record.encodingFormat === "string" ? record.encodingFormat : "";
      for (const key of ["src", "file", "contentUrl", "url", "link"]) if (typeof record[key] === "string") collect(record[key], mime);
      for (const [key, child] of Object.entries(record)) {
        if (typeof child === "string" && /^(embedUrl|iframe)$/i.test(key)) embed(child);
        walk(child, depth + 1);
      }
    }
  };
  const scan = (text: string, depth = 0) => {
    if (depth > 5) return;
    try { walk(JSON.parse(text)); return; } catch { /* Script or React Flight record. */ }
    let parsedFlight = false;
    for (const record of text.matchAll(/^[\da-z]+:(.*)$/gm)) {
      try { walk(JSON.parse(record[1])); parsedFlight = true; } catch { /* Non-JSON Flight record. */ }
    }
    if (parsedFlight) return;
    // React Flight chunks are JSON strings inside self.__next_f.push(...).
    // Decode string literals with JSON.parse; never eval a remote script.
    for (const match of text.matchAll(/"(?:\\.|[^"\\])*"/g)) {
      try {
        const value: unknown = JSON.parse(match[0]);
        if (typeof value !== "string") continue;
        collect(value);
        if (value.includes('"') || value.includes("\\\"")) scan(value, depth + 1);
      } catch { /* Ignore JavaScript-only escape sequences. */ }
    }
    for (const match of normalize(text).matchAll(/["']([^"'<>\\\s]+\.(?:mp4|m3u8|mpd)(?:\?[^"'<>\\\s]*)?)["']/gi)) collect(match[1]);
  };
  $("script").each((_, element) => {
    const text = $(element).html() || "";
    scan(text);
  });
  // Next.js Flight payloads can keep escaped URLs outside a parseable JSON
  // record. Scan the normalized document as a final, bounded URL pass.
  for (const match of normalize(html).matchAll(/https?:\/\/[^\s"'<>\\]+\.(?:m3u8|mp4|mpd)(?:\?[^\s"'<>\\]*)?/gi)) collect(match[0]);
  return { title: $("title").first().text().trim().slice(0, 200) || pageUrl.hostname, sources: [...sources.values()], embeds: [...embeds] };
}
