import Link from "next/link";
import { Download } from "lucide-react";
import { HOME_CONTENT } from "@/config/home-content";
import { HOME_PATHS, type Locale } from "@/config/locales";

export function Footer({ locale }: { locale: Locale }) { const copy = HOME_CONTENT[locale]; const home = HOME_PATHS[locale]; return <footer className="footer"><div className="footer-grid"><div><Link href={home} className="footer-brand"><Download size={23}/> VideoDownloader</Link><p>{copy.footer.description}</p></div><div><h3>{copy.footer.links}</h3><Link href={`${home}#analyzer`}>{copy.nav.download}</Link><Link href={`${home}#guide`}>{copy.nav.guide}</Link><Link href={`${home}#faq`}>{copy.nav.faq}</Link></div><div><h3>{copy.footer.legal}</h3><Link href="/terms">{copy.footer.terms}</Link><Link href="/privacy">{copy.footer.privacy}</Link><Link href="/copyright">{copy.footer.copyright}</Link></div><div><h3>{copy.footer.status}</h3><span className="status-line"><i/> {copy.footer.active}</span><small>{copy.footer.temporary}</small></div></div></footer>; }
