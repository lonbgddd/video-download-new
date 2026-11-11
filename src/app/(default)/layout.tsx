import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { getSiteUrl } from "@/config/site-url";
import "../globals.css";
import { Providers } from "../providers";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: "VideoDownloader – Tải nội dung công khai", template: "%s | VideoDownloader" },
  description: "Phân tích liên kết media công khai và tải các định dạng hợp lệ mà bạn có quyền sử dụng.",
  openGraph: { title: "VideoDownloader", description: "Công cụ tải media công khai an toàn và minh bạch.", type: "website", locale: "vi_VN" },
  twitter: { card: "summary_large_image", title: "VideoDownloader", description: "Phân tích và tải media công khai." },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0f17" },
  ],
};

export default function DefaultRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" suppressHydrationWarning><body><Providers>{children}</Providers><Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5107605542667246" strategy="beforeInteractive" crossOrigin="anonymous" /></body></html>;
}
