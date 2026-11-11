import Image from "next/image";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PlatformChips, PlatformStrip } from "@/features/platforms/platform-list";
import { UrlAnalyzer } from "@/features/downloader/url-analyzer";
import { FeatureCards, HowItWorks } from "@/components/marketing-sections";
import { AdSlot } from "@/components/ad-slot";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };
const faqData = [
  { "@type": "Question", name: "Web có miễn phí không?", acceptedAnswer: { "@type": "Answer", text: "Có. Các chức năng cơ bản không yêu cầu đăng ký." } },
  { "@type": "Question", name: "Có lưu video trên server không?", acceptedAnswer: { "@type": "Answer", text: "File chỉ được giữ tạm trong thời gian xử lý theo cấu hình hệ thống." } },
];

export default function Home() { return <><Header/><main><section className="hero"><div className="hero-decoration"/><div className="hero-inner"><div className="hero-copy"><span className="hero-kicker">AN TOÀN · MINH BẠCH · NHANH CHÓNG</span><h1>Tải video từ mọi nền tảng, nhanh và miễn phí</h1><p>Dán link video để xem các tùy chọn tải xuống thực sự có sẵn.</p><PlatformChips/></div><div className="hero-art"><Image src="/images/hero-video-download.png" alt="Minh họa màn hình video và biểu tượng tải xuống" fill priority sizes="(max-width: 900px) 0px, 360px"/></div></div><div className="analyzer-shell"><UrlAnalyzer/></div></section><div className="content-shell"><AdSlot position="below-analyzer"/><FeatureCards/><PlatformStrip/><HowItWorks/></div></main><Footer/><AdSlot position="mobile-sticky"/><Script id="video-downloader-structured-data" type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": [{ "@type": "WebApplication", name: "VideoDownloader", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "VND" } }, { "@type": "FAQPage", mainEntity: faqData }] }).replace(/</g, "\\u003c") }}/></>; }
