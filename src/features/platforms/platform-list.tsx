import { SiDailymotion, SiFacebook, SiInstagram, SiTiktok, SiTwitch, SiVimeo, SiX, SiYoutube } from "react-icons/si";
import { Link2 } from "lucide-react";
import type { IconType } from "react-icons";

const items: Array<{ name: string; Icon: IconType | typeof Link2; className: string; status: string }> = [
  { name: "YouTube", Icon: SiYoutube, className: "youtube", status: "Limited" }, { name: "Facebook", Icon: SiFacebook, className: "facebook", status: "Limited" },
  { name: "TikTok", Icon: SiTiktok, className: "tiktok", status: "Limited" }, { name: "Instagram", Icon: SiInstagram, className: "instagram", status: "Limited" },
  { name: "X", Icon: SiX, className: "x", status: "Limited" }, { name: "Vimeo", Icon: SiVimeo, className: "vimeo", status: "Limited" },
  { name: "Dailymotion", Icon: SiDailymotion, className: "dailymotion", status: "Limited" }, { name: "Twitch", Icon: SiTwitch, className: "twitch", status: "Limited" },
  { name: "Direct media", Icon: Link2, className: "direct", status: "Supported" },
];

export function PlatformChips() { return <div className="platform-chips" aria-label="Nguồn media"><span className="platform-chip direct"><Link2/> Link trực tiếp <small>Supported</small></span>{items.slice(0, 5).map(({ name, Icon, className }) => <span className={`platform-chip ${className}`} key={name}><Icon/> {name} <small>Limited</small></span>)}</div>; }
export function PlatformStrip() { return <section className="platform-strip" id="platforms"><h2>Hỗ trợ nhiều nguồn phổ biến</h2><div className="platform-logo-row">{items.map(({ name, Icon, className, status }) => <div className="platform-logo" key={name} title={`${name}: ${status}`}><Icon className={className}/><span>{name}</span><small className={status === "Supported" ? "supported" : "limited"}>{status}</small></div>)}</div></section>; }
