export type PlatformId = "direct" | "youtube" | "facebook" | "tiktok" | "instagram" | "x" | "vimeo" | "dailymotion" | "twitch" | "other";
export type PlatformStatus = "supported" | "limited" | "coming-soon";
export type MediaKind = "video" | "audio" | "thumbnail";

export interface MediaFormat {
  id: string;
  type: "video" | "audio";
  label: string;
  extension: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fps?: number;
  codec?: string;
  bitrate?: number;
  fileSize?: number;
  hasAudio: boolean;
  converted?: boolean;
}

export interface MediaMetadata {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  author?: string;
  platform: PlatformId;
  sourceUrl: string;
  formats: MediaFormat[];
  expiresAt: number;
}

export type JobStatus = "queued" | "processing" | "merging" | "converting" | "completed" | "failed" | "expired";

export interface DownloadJob {
  id: string;
  mediaId: string;
  formatId: string;
  type: MediaKind;
  status: JobStatus;
  progress: number | null;
  message: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  downloadToken?: string;
  error?: string;
}
