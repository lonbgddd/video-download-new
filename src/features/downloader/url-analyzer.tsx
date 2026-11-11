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
import { detectPlatform } from "@/config/platforms";
import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";
import { AdsterraNative } from "@/components/ads/adsterra-native";
import { requestAdcashInterstitial } from "@/components/ads/adcash-interstitial";

type Values = { url: string };

export function UrlAnalyzer({
  locale = "vi",
  adsEnabled = false,
}: {
  locale?: Locale;
  adsEnabled?: boolean;
}) {
  const copy = UI_CONTENT[locale].analyzer;
  const schema = z.object({ url: z.string().trim().url(copy.invalid).max(2048, copy.invalid) });
  const analyzer = useMediaAnalyzer(); const [pasteMessage, setPasteMessage] = useState(""); const [directLinkPending, setDirectLinkPending] = useState(false); const [directLinkError, setDirectLinkError] = useState("");
  const { register, handleSubmit, setValue, reset, control, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { url: "" } }); const value = useWatch({ control, name: "url" });
  const submit = ({ url }: Values) => {
    setDirectLinkError("");
    if (adsEnabled) requestAdcashInterstitial("analyze-submit");
    analyzer.mutate(url);
  };
  const openDirectLink = async () => {
    if (!value) return;
    const tab = window.open("about:blank", "_blank");
    if (!tab) { setDirectLinkError(copy.popup); return; }
    tab.opener = null;
    setDirectLinkError(""); setDirectLinkPending(true);
    try {
      const response = await fetch("/api/media/direct-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: value }) });
      const payload = await response.json() as ApiResponse<{ directUrl: string }>;
      if (!payload.success) throw new Error(payload.error.message);
      tab.location.replace(payload.data.directUrl);
    } catch (error) {
      tab.close();
      setDirectLinkError(locale === "vi" && error instanceof Error ? error.message : copy.directFailed);
    } finally { setDirectLinkPending(false); }
  };
  const paste = async () => { try { const text = await navigator.clipboard.readText(); setValue("url", text, { shouldValidate: true }); analytics.track("paste_url"); setPasteMessage(copy.pasted); setTimeout(() => setPasteMessage(""), 1500); } catch { setPasteMessage(copy.clipboard); } };
  const isSupportedYtDlpUrl = (() => {
    try {
      const url = new URL(value ?? "");
      const platform = detectPlatform(url.hostname);
      return platform !== "other" && platform !== "direct";
    } catch { return false; }
  })();
  const canOpenDirectLink = isSupportedYtDlpUrl && analyzer.error instanceof ApiRequestError &&
    ["MEDIA_TOO_LONG", "PROCESSING_FAILED", "FORMAT_NOT_AVAILABLE", "TIMEOUT"].includes(analyzer.error.code);
  return <div id="analyzer"><form className={`url-analyzer ${errors.url ? "invalid" : ""}`} onSubmit={handleSubmit(submit)} noValidate><Link2 className="input-icon"/><input {...register("url")} aria-label={copy.input} placeholder={copy.placeholder} autoComplete="url" disabled={analyzer.isPending}/>{value && <button type="button" className="clear-button" aria-label={copy.clear} onClick={() => { reset(); analyzer.reset(); }}><X/></button>}<button type="button" className="paste-button" onClick={paste}><ClipboardPaste/> <span>{pasteMessage || copy.paste}</span></button><button className="analyze-button" type="submit" disabled={analyzer.isPending}>{analyzer.isPending ? <LoaderCircle className="spin"/> : <Download/>}<span>{analyzer.isPending ? copy.analyzing : copy.analyze}</span></button></form>{errors.url && <p className="form-error" role="alert">{errors.url.message}</p>}<AdsterraNative enabled={adsEnabled} placement="near-input" label={UI_CONTENT[locale].misc.ad}/>{analyzer.error && <div className="api-error" role="alert"><strong>{copy.errorTitle}</strong><span>{locale === "vi" ? analyzer.error.message : copy.errorTitle}</span>{canOpenDirectLink && <><button className="primary-button" type="button" disabled={directLinkPending} onClick={() => void openDirectLink()}>{directLinkPending ? <LoaderCircle className="spin"/> : <Download/>}{directLinkPending ? copy.directLoading : copy.directOpen}</button><small>{copy.directHelp}</small>{directLinkError && <span role="alert">{directLinkError}</span>}</>}<button onClick={() => analyzer.reset()}>{copy.retry}</button></div>}{analyzer.isPending ? <LoadingSkeleton locale={locale}/> : analyzer.data ? <MediaResult media={analyzer.data} locale={locale} adsEnabled={adsEnabled}/> : !analyzer.error ? <EmptyState locale={locale}/> : null}{pasteMessage && <Toast message={pasteMessage} tone={pasteMessage === copy.pasted ? "success" : "error"}/>}</div>;
}
