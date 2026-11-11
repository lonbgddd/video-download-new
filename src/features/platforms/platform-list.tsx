import { SiBilibili, SiDailymotion, SiFacebook, SiInstagram, SiPinterest, SiReddit, SiSoundcloud, SiTiktok, SiTwitch, SiVimeo, SiX, SiYoutube } from "react-icons/si";
import { Link2 } from "lucide-react";
import type { IconType } from "react-icons";
import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";

const items: Array<{ name: string; Icon: IconType | typeof Link2; className: string; status: string }> = [
  { name: "YouTube", Icon: SiYoutube, className: "youtube", status: "Limited" }, { name: "Facebook", Icon: SiFacebook, className: "facebook", status: "Limited" },
  { name: "TikTok", Icon: SiTiktok, className: "tiktok", status: "Limited" }, { name: "Instagram", Icon: SiInstagram, className: "instagram", status: "Limited" },
  { name: "X", Icon: SiX, className: "x", status: "Limited" }, { name: "Vimeo", Icon: SiVimeo, className: "vimeo", status: "Limited" },
  { name: "Dailymotion", Icon: SiDailymotion, className: "dailymotion", status: "Limited" }, { name: "Twitch", Icon: SiTwitch, className: "twitch", status: "Limited" },
  { name: "Reddit", Icon: SiReddit, className: "reddit", status: "Limited" }, { name: "SoundCloud", Icon: SiSoundcloud, className: "soundcloud", status: "Limited" },
  { name: "Pinterest", Icon: SiPinterest, className: "pinterest", status: "Limited" }, { name: "Bilibili", Icon: SiBilibili, className: "bilibili", status: "Limited" },
  { name: "Direct media", Icon: Link2, className: "direct", status: "Supported" },
];

export function PlatformChips({ locale }: { locale: Locale }) { const copy = UI_CONTENT[locale].platform; return <div className="platform-chips" aria-label={copy.source}><span className="platform-chip direct"><Link2/> {copy.direct} <small>{copy.supported}</small></span>{items.slice(0, 5).map(({ name, Icon, className }) => <span className={`platform-chip ${className}`} key={name}><Icon/> {name} <small>{copy.limited}</small></span>)}</div>; }
export function PlatformStrip({ locale }: { locale: Locale }) { const copy = UI_CONTENT[locale].platform; return <section className="platform-strip" id="platforms"><h2>{copy.title}</h2><div className="platform-logo-row">{items.map(({ name, Icon, className, status }) => { const displayName = className === "direct" ? copy.direct : name; return <div className="platform-logo" key={name} title={`${displayName}: ${status === "Supported" ? copy.supported : copy.limited}`}><Icon className={className}/><span>{displayName}</span><small className={status === "Supported" ? "supported" : "limited"}>{status === "Supported" ? copy.supported : copy.limited}</small></div>; })}</div></section>; }
