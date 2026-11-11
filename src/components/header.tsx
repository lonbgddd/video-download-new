"use client";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, Download, Globe2, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { HOME_CONTENT } from "@/config/home-content";
import { UI_CONTENT } from "@/config/ui-content";
import { HOME_PATHS, LOCALE_INFO, LOCALES, type Locale } from "@/config/locales";

export function Header({ locale }: { locale: Locale }) {
  const [mobileOpen, setMobileOpen] = useState(false); const [languageOpen, setLanguageOpen] = useState(false); const { resolvedTheme, setTheme } = useTheme();
  const copy = HOME_CONTENT[locale]; const home = HOME_PATHS[locale];
  const ui = UI_CONTENT[locale].misc;
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href={home} aria-label={`VideoDownloader - ${copy.nav.download}`}><span className="brand-icon"><Download size={21}/></span><span>VideoDownloader</span></Link>
    <nav className="desktop-nav" aria-label={copy.nav.menu}><Link className="active" href={`${home}#analyzer`}>{copy.nav.download}</Link><Link href={`${home}#guide`}>{copy.nav.guide}</Link><Link href={`${home}#platforms`}>{copy.nav.tools} <ChevronDown size={15}/></Link><Link href={`${home}#faq`}>{copy.nav.faq}</Link></nav>
    <div className="header-actions">
      <button className="icon-pill" aria-label={copy.nav.theme} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}><Sun size={18}/><span className="toggle-dot"><Moon size={17}/></span></button>
      <div className="language-wrap"><button className="language-button" onClick={() => setLanguageOpen(!languageOpen)} aria-expanded={languageOpen} aria-controls="home-language-menu"><Globe2 size={17}/> {LOCALE_INFO[locale].nativeName} <ChevronDown size={15}/></button>{languageOpen && <div className="language-menu" id="home-language-menu" aria-label={copy.nav.language}>{LOCALES.map((code) => <Link key={code} href={HOME_PATHS[code]} lang={code} hrefLang={code} aria-current={code === locale ? "page" : undefined} onClick={() => setLanguageOpen(false)}>{LOCALE_INFO[code].nativeName}</Link>)}</div>}</div>
      <button className="login-button" onClick={() => alert(ui.loginSoon)}><UserRound size={17}/> {ui.login}</button>
      <button className="mobile-menu-button" aria-label={copy.nav.menu} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X/> : <Menu/>}</button>
    </div>
  </div>{mobileOpen && <nav className="mobile-nav"><Link href={`${home}#analyzer`} onClick={() => setMobileOpen(false)}>{copy.nav.download}</Link><Link href={`${home}#guide`} onClick={() => setMobileOpen(false)}>{copy.nav.guide}</Link><Link href="/history">{copy.nav.history}</Link><Link href={`${home}#faq`} onClick={() => setMobileOpen(false)}>{copy.nav.faq}</Link></nav>}</header>;
}
