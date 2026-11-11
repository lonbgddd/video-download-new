import { Inter, Noto_Sans_JP, Noto_Sans_KR } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const notoSansJp = Noto_Sans_JP({
  weight: "variable",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

const notoSansKr = Noto_Sans_KR({
  weight: "variable",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

export function getLocaleFontClass(locale: string) {
  if (locale === "ja") return notoSansJp.className;
  if (locale === "ko") return notoSansKr.className;
  return inter.className;
}
