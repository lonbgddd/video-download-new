"use client";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ClipboardPaste, Download, Link2, LoaderCircle, X } from "lucide-react";
import { useMediaAnalyzer } from "@/hooks/use-media-analyzer";
import { analytics } from "@/services/analytics/analytics-adapter";
import { LoadingSkeleton } from "./loading-skeleton";
import { MediaResult } from "./media-result";
import { EmptyState } from "./empty-state";
import { Toast } from "@/components/ui/toast";
import { ApiRequestError, type ApiResponse } from "@/types/api";

const schema = z.object({ url: z.string().trim().url("Hãy nhập một URL hợp lệ bắt đầu bằng http:// hoặc https://").max(2048) });
type Values = z.infer<typeof schema>;

export function UrlAnalyzer() {
  const analyzer = useMediaAnalyzer(); const [pasteMessage, setPasteMessage] = useState(""); const [directLinkPending, setDirectLinkPending] = useState(false); const [directLinkError, setDirectLinkError] = useState("");
  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { url: "" } }); const value = useWatch({ control, name: "url" });
  const submit = ({ url }: Values) => { setDirectLinkError(""); analyzer.mutate(url); };
  const openDirectLink = async () => {
    if (!value) return;
    const tab = window.open("about:blank", "_blank");
    if (!tab) { setDirectLinkError("Cho phép cửa sổ bật lên để mở video trong tab mới."); return; }
    tab.opener = null;
    setDirectLinkError(""); setDirectLinkPending(true);
    try {
      const response = await fetch("/api/media/direct-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: value }) });
      const payload = await response.json() as ApiResponse<{ directUrl: string }>;
      if (!payload.success) throw new Error(payload.error.message);
      tab.location.replace(payload.data.directUrl);
    } catch (error) {
      tab.close();
      setDirectLinkError(error instanceof Error ? error.message : "Không thể lấy link video trực tiếp.");
    } finally { setDirectLinkPending(false); }
  };
  const paste = async () => { try { const text = await navigator.clipboard.readText(); setValue("url", text, { shouldValidate: true }); analytics.track("paste_url"); setPasteMessage("Đã dán"); setTimeout(() => setPasteMessage(""), 1500); } catch { setPasteMessage("Trình duyệt không cho phép đọc clipboard"); } };
  const canOpenDirectLink = analyzer.error instanceof ApiRequestError && analyzer.error.code === "MEDIA_TOO_LONG" && value;
  return <div id="analyzer"><form className={`url-analyzer ${errors.url ? "invalid" : ""}`} onSubmit={handleSubmit(submit)} noValidate><Link2 className="input-icon"/><input {...register("url")} aria-label="URL video" placeholder="Dán link video vào đây..." autoComplete="url" disabled={analyzer.isPending}/>{value && <button type="button" className="clear-button" aria-label="Xóa URL" onClick={() => { reset(); analyzer.reset(); }}><X/></button>}<button type="button" className="paste-button" onClick={paste}><ClipboardPaste/> <span>{pasteMessage || "Dán link"}</span></button><button className="analyze-button" type="submit" disabled={analyzer.isPending}>{analyzer.isPending ? <LoaderCircle className="spin"/> : <Download/>}<span>{analyzer.isPending ? "Đang phân tích..." : "Phân tích"}</span></button></form>{errors.url && <p className="form-error" role="alert">{errors.url.message}</p>}{analyzer.error && <div className="api-error" role="alert"><strong>Không thể phân tích liên kết này.</strong><span>{analyzer.error.message}</span>{canOpenDirectLink && <><button className="primary-button" type="button" disabled={directLinkPending} onClick={() => void openDirectLink()}>{directLinkPending ? <LoaderCircle className="spin"/> : <Download/>}{directLinkPending ? "Đang lấy link video..." : "Mở luồng video trực tiếp ở tab mới"}</button><small>Nguồn sẽ phát file trực tiếp; nếu video phát trong trình duyệt, hãy dùng menu chuột phải để lưu video.</small>{directLinkError && <span role="alert">{directLinkError}</span>}</>}<button onClick={() => analyzer.reset()}>Thử lại</button></div>}{analyzer.isPending ? <LoadingSkeleton/> : analyzer.data ? <MediaResult media={analyzer.data}/> : !analyzer.error ? <EmptyState/> : null}{pasteMessage && <Toast message={pasteMessage} tone={pasteMessage === "Đã dán" ? "success" : "error"}/>}</div>;
}
