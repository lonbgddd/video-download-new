"use client";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "next-themes";
import { ChevronDown, Download, Globe2, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import { DEFAULT_LANDING_PATHS, LOCALE_INFO, LOCALES } from "@/config/locales";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false); const [languageOpen, setLanguageOpen] = useState(false); const { resolvedTheme, setTheme } = useTheme();
  return <header className="site-header"><div className="header-inner">
    <Link className="brand" href="/" aria-label="VideoDownloader - trang chủ"><span className="brand-icon"><Download size={21}/></span><span>VideoDownloader</span></Link>
    <nav className="desktop-nav" aria-label="Điều hướng chính"><a className="active" href="#analyzer">Tải video</a><a href="#guide">Hướng dẫn</a><a href="#platforms">Kho tiện ích <ChevronDown size={15}/></a><a href="#faq">FAQ</a></nav>
    <div className="header-actions">
      <button className="icon-pill" aria-label="Đổi giao diện" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}><Sun size={18}/><span className="toggle-dot"><Moon size={17}/></span></button>
      <div className="language-wrap"><button className="language-button" onClick={() => setLanguageOpen(!languageOpen)} aria-expanded={languageOpen} aria-controls="home-language-menu"><Globe2 size={17}/> Tiếng Việt <ChevronDown size={15}/></button>{languageOpen && <div className="language-menu" id="home-language-menu" aria-label="Chọn ngôn ngữ">{LOCALES.map((locale) => <Link key={locale} href={DEFAULT_LANDING_PATHS[locale]} lang={locale} onClick={() => setLanguageOpen(false)}>{LOCALE_INFO[locale].nativeName}</Link>)}</div>}</div>
      <button className="login-button" onClick={() => alert("Đăng nhập sẽ được bổ sung trong phiên bản sau.")}><UserRound size={17}/> Đăng nhập</button>
      <button className="mobile-menu-button" aria-label="Mở menu" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X/> : <Menu/>}</button>
    </div>
  </div>{mobileOpen && <nav className="mobile-nav"><a href="#analyzer" onClick={() => setMobileOpen(false)}>Tải video</a><a href="#guide" onClick={() => setMobileOpen(false)}>Hướng dẫn</a><Link href="/history">Lịch sử</Link><a href="#faq" onClick={() => setMobileOpen(false)}>FAQ</a></nav>}</header>;
}
