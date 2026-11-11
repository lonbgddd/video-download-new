import Link from "next/link";
import { ChevronDown, Download } from "lucide-react";
import {
  getLocalizedRoutesForLocale,
  getRouteForPage,
  LOCALE_INFO,
  LOCALES,
  type Locale,
} from "@/config/i18n.config";
import { getLocalizedPath } from "@/lib/seo/metadata";
import { HOME_PATHS } from "@/config/locales";
import { LocaleSwitcher } from "./LocaleSwitcher";

const labels: Record<Locale, { tools: string; video: string; audio: string; home: string; menu: string; language: string }> = {
  en: { tools: "Tools", video: "Video downloads", audio: "Audio tools", home: "Home", menu: "Open tools menu", language: "Choose language" },
  vi: { tools: "Công cụ", video: "Tải video", audio: "Công cụ âm thanh", home: "Trang chủ", menu: "Mở danh sách công cụ", language: "Chọn ngôn ngữ" },
  es: { tools: "Herramientas", video: "Vídeo", audio: "Audio", home: "Inicio", menu: "Abrir menú de herramientas", language: "Elegir idioma" },
  ja: { tools: "ツール", video: "動画", audio: "音声", home: "ホーム", menu: "ツールメニューを開く", language: "言語を選択" },
  fr: { tools: "Outils", video: "Téléchargement vidéo", audio: "Outils audio", home: "Accueil", menu: "Ouvrir le menu des outils", language: "Choisir la langue" },
  pt: { tools: "Ferramentas", video: "Transferir vídeos", audio: "Ferramentas de áudio", home: "Início", menu: "Abrir o menu de ferramentas", language: "Escolher idioma" },
  ko: { tools: "도구", video: "동영상 다운로드", audio: "오디오 도구", home: "홈", menu: "도구 메뉴 열기", language: "언어 선택" },
};

export function LocaleTopicHeader({ locale, currentPageId }: { locale: Locale; currentPageId?: string }) {
  const routes = getLocalizedRoutesForLocale(locale);
  const current = routes.find((route) => route.page.id === currentPageId) ?? routes[0];
  const videoRoutes = routes.filter((route) => route.page.category === "video").slice(0, 8);
  const audioRoutes = routes.filter((route) => route.page.category === "audio").slice(0, 8);
  const localeOptions = LOCALES.map((code) => ({
    href: current ? getLocalizedPath(getRouteForPage(current.page, code)) : "/",
    label: LOCALE_INFO[code].nativeName,
  }));

  return (
    <header className="locale-header">
      <div className="locale-header-inner">
        <Link className="locale-brand" href={HOME_PATHS[locale]} aria-label={`${labels[locale].home} - VideoDownloader`}>
          <span className="locale-brand-icon"><Download size={19} aria-hidden="true" /></span>
          <span>VideoDownloader</span>
        </Link>
        <nav className="locale-main-nav" aria-label={labels[locale].tools}>
          <details className="topic-menu">
            <summary aria-label={labels[locale].menu}>{labels[locale].tools}<ChevronDown size={16} aria-hidden="true" /></summary>
            <div className="topic-mega-menu">
              <section aria-labelledby="topic-video-title">
                <h2 id="topic-video-title">{labels[locale].video}</h2>
                <ul>{videoRoutes.map((route) => <li key={route.page.id}><Link href={getLocalizedPath(route)}>{route.content.title}</Link></li>)}</ul>
              </section>
              <section aria-labelledby="topic-audio-title">
                <h2 id="topic-audio-title">{labels[locale].audio}</h2>
                <ul>{audioRoutes.map((route) => <li key={route.page.id}><Link href={getLocalizedPath(route)}>{route.content.title}</Link></li>)}</ul>
              </section>
            </div>
          </details>
        </nav>
        <LocaleSwitcher ariaLabel={labels[locale].language} currentHref={current ? getLocalizedPath(current) : "/"} options={localeOptions} />
      </div>
    </header>
  );
}

export function LocaleTopicFooter({ locale }: { locale: Locale }) {
  const footerCopy: Record<Locale, string> = {
    en: "Use this service only with media you own or are authorized to save.",
    vi: "Chỉ sử dụng dịch vụ với nội dung bạn sở hữu hoặc được phép lưu.",
    es: "Utiliza el servicio solo con contenido propio o autorizado.",
    ja: "所有または許可を得たメディアのみご利用ください。",
    fr: "Utilisez ce service uniquement avec des contenus que vous possédez ou êtes autorisé à enregistrer.",
    pt: "Utiliza este serviço apenas com conteúdos teus ou para os quais tenhas autorização.",
    ko: "본인이 소유하거나 저장 권한이 있는 미디어만 이용하세요.",
  };
  return (
    <footer className="locale-footer">
      <div className="locale-footer-inner">
        <Link href={HOME_PATHS[locale]}>VideoDownloader</Link>
        <p>{footerCopy[locale]}</p>
      </div>
    </footer>
  );
}
