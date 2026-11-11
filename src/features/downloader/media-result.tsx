"use client";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import {
  Download,
  ExternalLink,
  ImageIcon,
  Music2,
  Play,
  Video,
} from "lucide-react";
import type { MediaFormat, MediaMetadata } from "@/types/media";
import { formatBytes, formatDuration } from "@/lib/format";
import { DownloadModal } from "./download-modal";
import { useDownloadHistory } from "@/hooks/use-download-history";
import { analytics } from "@/services/analytics/analytics-adapter";
import { motion } from "framer-motion";
import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";

type Tab = "video" | "audio" | "thumbnail";
const videoLabels: Record<Locale, string> = { vi: "Video", en: "Video", es: "Vídeo", fr: "Vidéo", pt: "Vídeo", ja: "動画", ko: "동영상" };
const convertedLabels: Record<Locale, string> = { vi: "Đã chuyển đổi", en: "Converted", es: "Convertido", fr: "Converti", pt: "Convertido", ja: "変換済み", ko: "변환됨" };
export function MediaResult({
  media,
  locale,
}: {
  media: MediaMetadata;
  locale: Locale;
}) {
  const copy = UI_CONTENT[locale].result;
  const [tab, setTab] = useState<Tab>(
    media.formats.some((item) => item.type === "video") ? "video" : "audio",
  );
  const formats = useMemo(
    () => media.formats.filter((item) => item.type === tab),
    [media.formats, tab],
  );
  const [selected, setSelected] = useState<string>(
    () => formats[0]?.id ?? media.formats[0].id,
  );
  const [jobId, setJobId] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { add } = useDownloadHistory();
  const chosen =
    media.formats.find((item) => item.id === selected) ?? formats[0];
  const switchTab = (next: Tab) => {
    setTab(next);
    const first = media.formats.find((item) => item.type === next);
    if (first) setSelected(first.id);
  };
  const startDownload = async () => {
    if (!chosen) return;
    setCreating(true);
    analytics.track("download_started", { type: tab, format: chosen.id });
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: media.id,
          formatId: chosen.id,
          type: tab,
        }),
      });
      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error.message);
      setJobId(payload.data.jobId);
      setModalOpen(true);
    } catch (error) {
      analytics.track("download_failed");
      alert(
        locale === "vi" && error instanceof Error
          ? error.message
          : copy.createFailed,
      );
    } finally {
      setCreating(false);
    }
  };
  const onCompleted = useCallback(() => {
    if (!chosen || !jobId) return;
    analytics.track("download_completed");
    add({
      id: jobId,
      mediaId: media.id,
      title: media.title,
      thumbnail: media.thumbnail,
      platform: media.platform,
      downloadType: tab,
      quality: chosen.label,
      timestamp: Date.now(),
    });
  }, [add, chosen, jobId, media, tab]);
  return (
    <motion.section
      className="media-result"
      aria-label={copy.aria}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="media-summary">
        <div className="thumbnail-wrap">
          {media.thumbnail ? (
            <Image
              src={`/api/media/thumbnail?id=${media.id}`}
              alt={`${copy.thumbnail} ${media.title}`}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <Image
              src="/images/demo-nature.png"
              alt={copy.fallbackThumbnail}
              fill
              sizes="300px"
            />
          )}
          <span className="play-overlay">
            <Play fill="currentColor" />
          </span>
          {media.duration && (
            <span className="duration-badge">
              {formatDuration(media.duration)}
            </span>
          )}
        </div>
        <div className="media-copy">
          <span className="result-label">{copy.success}</span>
          <h2>{media.title}</h2>
          <p>{media.author || copy.unknownAuthor}</p>
          <div>
            <span className="platform-dot" /> {media.platform} ·{" "}
            {formatDuration(media.duration)}
          </div>
        </div>
      </div>
      <div className="format-panel">
        <div className="format-tabs" role="tablist">
          <button
            className={tab === "video" ? "active" : ""}
            onClick={() => switchTab("video")}
            disabled={!media.formats.some((item) => item.type === "video")}
          >
            <Video /> {videoLabels[locale]}
          </button>
          <button
            className={tab === "audio" ? "active" : ""}
            onClick={() => switchTab("audio")}
            disabled={!media.formats.some((item) => item.type === "audio")}
          >
            <Music2 /> {copy.audio}
          </button>
          <button
            className={tab === "thumbnail" ? "active" : ""}
            onClick={() => switchTab("thumbnail")}
            disabled={!media.thumbnail}
          >
            <ImageIcon /> {copy.cover}
          </button>
        </div>
        {tab === "thumbnail" ? (
          <div className="thumbnail-actions">
            <p>{copy.coverReady}</p>
            <a
              className="primary-button"
              href={`/api/media/thumbnail?id=${media.id}`}
              download
            >
              <Download /> {copy.downloadCover}
            </a>
            <a
              className="secondary-button"
              href={`/api/media/thumbnail?id=${media.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink /> {copy.openCover}
            </a>
          </div>
        ) : (
          <div
            className="format-list"
            role="radiogroup"
            aria-label={copy.chooseFormat}
          >
            {formats.map((format) => (
              <FormatRow
                key={format.id}
                format={format}
                selected={selected === format.id}
                onSelect={() => {
                  setSelected(format.id);
                  analytics.track("format_selected", { format: format.id });
                }}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
      <div className="download-action">
        {tab !== "thumbnail" && (
          <>
            <div>
              <small>{copy.selected}</small>
              <strong>
                {chosen ? localizeFormatLabel(chosen, locale) : copy.none}
              </strong>
              <span>
                {chosen?.extension.toUpperCase()} ·{" "}
                {formatBytes(chosen?.fileSize, copy.unknown)}
              </span>
            </div>
            <button
              className="primary-button download-cta"
              onClick={startDownload}
              disabled={!chosen || creating}
            >
              <Download />
              {creating
                ? copy.creating
                : `${copy.download} ${chosen ? localizeFormatLabel(chosen, locale) : ""}`}
            </button>
            <p>{copy.rights}</p>
          </>
        )}
      </div>
      <DownloadModal
        jobId={jobId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onCompleted={onCompleted}
        locale={locale}
      />
    </motion.section>
  );
}

function localizeFormatLabel(format: MediaFormat, locale: Locale) {
  const copy = UI_CONTENT[locale].result;
  if (format.id.startsWith("direct-")) return copy.originalQuality;
  if (format.type === "video" && !format.height) return videoLabels[locale];
  if (format.type === "audio" && !format.bitrate) return copy.originalAudio;
  return format.label;
}
function FormatRow({
  format,
  selected,
  onSelect,
  locale,
}: {
  format: MediaFormat;
  selected: boolean;
  onSelect: () => void;
  locale: Locale;
}) {
  const copy = UI_CONTENT[locale].result;
  return (
    <button
      className={`format-row ${selected ? "selected" : ""}`}
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
    >
      <span className="radio-dot" />
      <span className="format-name">
        {localizeFormatLabel(format, locale)}
        <small>
          {format.hasAudio ? copy.hasAudio : copy.videoOnly}
          {format.converted ? ` · ${convertedLabels[locale]}` : ""}
        </small>
      </span>
      <span className="format-meta">
        {format.extension.toUpperCase()}
        <small>
          {format.fps ? `${format.fps} FPS · ` : ""}
          {formatBytes(format.fileSize, copy.unknown)}
        </small>
      </span>
    </button>
  );
}
