"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ClipboardPaste, Download, Film, LoaderCircle, Search } from "lucide-react";
import { movieCopy } from "@/config/movie-content";
import type { Locale } from "@/config/locales";

type MovieResult = { title: string; status: "ready" | "hls_only" | "no_mp4"; incomplete: boolean; pagesScanned: number; blockedPlayers: number; discovered: { url: string; kind: "mp4" | "hls" | "dash"; pageUrl: string; verified: boolean; downloadUrl?: string; conversionId?: string }[]; sources: { id: string; label: string; fileSize?: number; downloadUrl: string }[] };

export function MovieDownloader({ locale }: { locale: Locale }) {
  const copy = movieCopy(locale);
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MovieResult | null>(null);
  const [converting, setConverting] = useState<string | null>(null);
  const [converted, setConverted] = useState<Record<string, string>>({});
  const conversionController = useRef<AbortController | null>(null);
  useEffect(() => () => conversionController.current?.abort(), []);
  async function convert(id: string) {
    const current = new AbortController(); conversionController.current = current;
    setConverting(id); setError("");
    try {
      const response = await fetch("/api/movies/convert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }), signal: current.signal });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || copy.error);
      setConverted((previous) => ({ ...previous, [id]: payload.data.downloadUrl }));
    } catch (failure) {
      if (!current.signal.aborted) setError(failure instanceof Error ? failure.message : copy.error);
    } finally { setConverting(null); }
  }
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    conversionController.current?.abort(); setConverted({});
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setPending(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/movies/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim() }), signal: current.signal });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message);
      setResult(payload.data);
    } catch (failure) {
      if (!current.signal.aborted) setError(locale === "vi" && failure instanceof Error ? `${copy.error} ${failure.message}` : copy.error);
    } finally { if (!current.signal.aborted) setPending(false); }
  }

  async function paste() {
    try { setUrl(await navigator.clipboard.readText()); setError(""); setResult(null); }
    catch { setError(copy.clipboard); }
  }

  return <main className="movie-tool">
    <div className="movie-heading"><span className="movie-icon"><Film size={30}/></span><h1>{copy.title}</h1><p>{copy.description}</p></div>
    <section className="movie-panel" aria-label={copy.nav}>
      <form onSubmit={analyze}>
        <label htmlFor="movie-url">{copy.input}</label>
        <div className="movie-input-row"><input id="movie-url" type="url" required maxLength={2048} placeholder="https://example.com/watch/movie" value={url} disabled={pending || Boolean(converting)} onChange={(event) => { setUrl(event.target.value); setResult(null); setError(""); }}/><button type="button" disabled={pending || Boolean(converting)} onClick={() => void paste()}><ClipboardPaste size={18}/>{copy.paste}</button></div>
        <button className="primary-button movie-submit" type="submit" disabled={pending || Boolean(converting) || !url.trim()}>{pending ? <LoaderCircle className="spin" size={19}/> : <Search size={19}/>} {pending ? copy.loading : copy.analyze}</button>
      </form>
      {pending && <p role="status" className="movie-notice">{copy.loading}</p>}
      {error && <p role="alert" className="movie-notice movie-error">{error}</p>}
      {result && <section className="movie-results" aria-label={copy.results}>
        <h2>{result.title}</h2><p>{copy.results}: {result.discovered.length}</p>
        {result.incomplete && <p className="movie-notice">{locale === "vi" ? `Kết quả chưa đầy đủ: đã đọc ${result.pagesScanned} trang/player; ${result.blockedPlayers} player không truy cập được. Có thể đã chạm giới hạn thời gian hoặc số trang.` : `Partial results: ${result.pagesScanned} pages/players scanned; ${result.blockedPlayers} unavailable. A scan limit may have been reached.`}</p>}
        <div className="movie-source-list">{result.discovered.map((item) => <div className="movie-source" key={item.url}><div style={{ minWidth: 0 }}><strong>{item.kind.toUpperCase()} · {item.verified ? (locale === "vi" ? "Đã xác minh" : "Verified") : (locale === "vi" ? "Chưa xác minh tải xuống" : "Download not verified")}</strong><a href={item.url} target="_blank" rel="noopener noreferrer" style={{ overflowWrap: "anywhere", display: "block", textDecoration: "underline" }}>{item.url}</a><small>{new URL(item.pageUrl).hostname}</small></div><div className="movie-source-actions">{item.conversionId && (converted[item.conversionId] ? <a className="primary-button" href={converted[item.conversionId]} download>{locale === "vi" ? "Tải MP4 đã ghép (1 lần, trong 10 phút)" : "Download MP4 (once, within 10 minutes)"}</a> : <button className="primary-button" type="button" disabled={Boolean(converting)} onClick={() => void convert(item.conversionId!)}>{converting === item.conversionId ? <LoaderCircle className="spin" size={18}/> : <Download size={18}/>} {locale === "vi" ? (converting === item.conversionId ? "Đang tải các đoạn và ghép MP4…" : "Chuyển thành MP4") : (converting === item.conversionId ? "Downloading segments and creating MP4…" : "Convert to MP4")}</button>)}{converting === item.conversionId && <button type="button" onClick={() => conversionController.current?.abort()}>{locale === "vi" ? "Hủy chuyển đổi" : "Cancel conversion"}</button>}{item.downloadUrl && <a className="primary-button" href={item.downloadUrl} download><Download size={18}/>{locale === "vi" ? "Tải playlist gốc (.m3u8)" : "Download original playlist (.m3u8)"}</a>}<button type="button" onClick={() => { void navigator.clipboard.writeText(item.url).catch(() => setError(copy.clipboard)); }}>{locale === "vi" ? "Sao chép link" : "Copy link"}</button></div></div>)}</div>
      </section>}
      {result && <section className="movie-results" aria-live="polite">{result.status !== "ready" ? <p className="movie-notice">{result.discovered.length ? (locale === "vi" ? "Đã tìm thấy link nguồn phát gốc ở trên. Bấm vào link để mở hoặc sao chép vào trình phát hỗ trợ HLS/DASH (như VLC). Nút tải playlist chỉ lưu file .m3u8 gốc, không bao gồm các đoạn phim. Link tương đối trong file vẫn phụ thuộc URL nguồn. Chọn “Chuyển thành MP4” để ghép phim HLS VOD không mã hóa. Quá trình có thể mất vài phút; chưa hỗ trợ audio tách riêng và byte-range." : "Original stream URLs are listed above. Open or copy them into an HLS/DASH player such as VLC. Use Convert to MP4 for unencrypted HLS VOD. Separate audio playlists and byte ranges are not supported.") : copy.empty}</p> : <><p>{copy.results}: {result.sources.length}</p><div className="movie-source-list">{result.sources.map((source) => <div className="movie-source" key={source.id}><div><strong>{source.label}</strong>{source.fileSize !== undefined && <small>{(source.fileSize / 1024 / 1024).toLocaleString(locale, { maximumFractionDigits: 1 })} MB</small>}</div><a className="primary-button" href={source.downloadUrl} download><Download size={18}/>{copy.download}</a></div>)}</div><p className="movie-expiry">{copy.expiry}</p></>}</section>}
      {!pending && !result && !error && <p className="movie-notice">{copy.steps}</p>}
    </section>
    <p className="movie-limits">{locale === "vi" ? "Chỉ tải nội dung bạn có quyền lưu. Hỗ trợ MP4 và chuyển HLS VOD không mã hóa sang MP4; không hỗ trợ DRM hoặc nguồn yêu cầu đăng nhập." : "Save only authorized content. Supports MP4 and unencrypted HLS VOD conversion; no DRM or sign-in sources."}</p>
  </main>;
}
