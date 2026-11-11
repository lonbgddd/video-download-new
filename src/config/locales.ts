export const LOCALES = ["en", "vi", "es", "ja", "fr", "pt", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_INFO: Record<Locale, { name: string; nativeName: string; ogLocale: string }> = {
  en: { name: "English", nativeName: "English", ogLocale: "en_US" },
  vi: { name: "Vietnamese", nativeName: "Tiếng Việt", ogLocale: "vi_VN" },
  es: { name: "Spanish", nativeName: "Español", ogLocale: "es_ES" },
  ja: { name: "Japanese", nativeName: "日本語", ogLocale: "ja_JP" },
  fr: { name: "French", nativeName: "Français", ogLocale: "fr_FR" },
  pt: { name: "Portuguese (Portugal)", nativeName: "Português (Portugal)", ogLocale: "pt_PT" },
  ko: { name: "Korean", nativeName: "한국어", ogLocale: "ko_KR" },
};

export const DEFAULT_LANDING_PATHS: Record<Locale, string> = {
  en: "/en/video-downloader/fast-free-video-downloader",
  vi: "/vi/cong-cu-tai-video/tai-video-cong-khai-nhanh",
  es: "/es/descargar-videos/guardar-videos-publicos-sin-instalar",
  ja: "/ja/douga-download/koukai-douga-offline-hozon",
  fr: "/fr/telecharger-videos/enregistrer-video-publique",
  pt: "/pt/baixar-videos/guardar-video-publico-no-navegador",
  ko: "/ko/video-download/gonggae-dongyeongsang-jeojang",
};
