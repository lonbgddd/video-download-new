import { Link2, ShieldCheck, Sparkles } from "lucide-react";
import { UI_CONTENT } from "@/config/ui-content";
import type { Locale } from "@/config/locales";
export function EmptyState({ locale }: { locale: Locale }) { const copy = UI_CONTENT[locale].empty; return <section className="empty-result" aria-label={copy.aria}><div className="empty-icon"><Link2/></div><div><h2>{copy.title}</h2><p>{copy.description}</p></div><span><ShieldCheck/> {copy.noDrm}</span><span><Sparkles/> {copy.honest}</span></section>; }
