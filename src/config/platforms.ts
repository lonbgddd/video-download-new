import type { PlatformId, PlatformStatus } from "@/types/media";

export const platforms: Array<{ id: PlatformId; name: string; domains: string[]; status: PlatformStatus; note: string }> = [
  { id: "direct", name: "Direct media", domains: [], status: "supported", note: "Liên kết trực tiếp MP4, WebM, MP3, M4A" },
  { id: "youtube", name: "YouTube", domains: ["youtube.com", "youtu.be"], status: "limited", note: "Cần yt-dlp; chỉ nội dung công khai" },
  { id: "facebook", name: "Facebook", domains: ["facebook.com", "fb.watch"], status: "limited", note: "Cần yt-dlp; nội dung công khai" },
  { id: "tiktok", name: "TikTok", domains: ["tiktok.com"], status: "limited", note: "Cần yt-dlp; nội dung công khai" },
  { id: "instagram", name: "Instagram", domains: ["instagram.com"], status: "limited", note: "Cần yt-dlp; bài đăng công khai" },
  { id: "x", name: "X", domains: ["x.com", "twitter.com"], status: "limited", note: "Cần yt-dlp; bài đăng công khai" },
  { id: "vimeo", name: "Vimeo", domains: ["vimeo.com"], status: "limited", note: "Cần yt-dlp; video công khai" },
  { id: "dailymotion", name: "Dailymotion", domains: ["dailymotion.com", "dai.ly"], status: "limited", note: "Cần yt-dlp; video công khai" },
  { id: "twitch", name: "Twitch", domains: ["twitch.tv"], status: "limited", note: "Cần yt-dlp; nội dung công khai" },
  { id: "reddit", name: "Reddit", domains: ["reddit.com", "redd.it"], status: "limited", note: "Cần yt-dlp; video công khai" },
  { id: "soundcloud", name: "SoundCloud", domains: ["soundcloud.com"], status: "limited", note: "Cần yt-dlp; audio công khai" },
  { id: "pinterest", name: "Pinterest", domains: ["pinterest.com", "pin.it"], status: "limited", note: "Cần yt-dlp; nội dung công khai" },
  { id: "bilibili", name: "Bilibili", domains: ["bilibili.com", "b23.tv"], status: "limited", note: "Cần yt-dlp; nội dung công khai" },
];

export function detectPlatform(hostname: string): PlatformId {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return platforms.find((platform) => platform.domains.some((domain) => host === domain || host.endsWith(`.${domain}`)))?.id ?? "other";
}
