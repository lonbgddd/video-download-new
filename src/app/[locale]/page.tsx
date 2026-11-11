import Image from "next/image";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PlatformChips, PlatformStrip } from "@/features/platforms/platform-list";
import { UrlAnalyzer } from "@/features/downloader/url-analyzer";
import { FeatureCards, HowItWorks } from "@/components/marketing-sections";
import { AdSlot } from "@/components/ad-slot";
import { HOME_CONTENT } from "@/config/home-content";
import { DEFAULT_LOCALE, HOME_PATHS, LOCALES } from "@/config/locales";
import { isLocale } from "@/config/i18n.config";
import { GUIDE_CONTENT } from "@/config/guide-content";
import { LOCALE_INFO } from "@/config/locales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const seo = GUIDE_CONTENT[locale].seo;
  return { title: seo.title, description: seo.description, keywords: seo.keywords, alternates: { canonical: HOME_PATHS[locale], languages: { ...HOME_PATHS, "x-default": HOME_PATHS[DEFAULT_LOCALE] } }, openGraph: { title: seo.title, description: seo.description, locale: LOCALE_INFO[locale].ogLocale, type: "website" }, twitter: { card: "summary_large_image", title: seo.title, description: seo.description } };
}

export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }

export default async function LocalizedHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = HOME_CONTENT[locale];
  const guide = GUIDE_CONTENT[locale];
  const adsEnabled = process.env.ADS_ENABLED === "true";
  const structuredData = { "@context": "https://schema.org", "@graph": [{ "@type": "WebApplication", name: "VideoDownloader", applicationCategory: "MultimediaApplication", operatingSystem: "Web", inLanguage: locale, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }, { "@type": "HowTo", inLanguage: locale, name: guide.guide.title, step: guide.guide.steps.map(([name, text]) => ({ "@type": "HowToStep", name, text })) }, { "@type": "FAQPage", inLanguage: locale, mainEntity: guide.faq.items.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }] };
  return <><Header locale={locale}/><main><section className="hero"><div className="hero-decoration"/><div className="hero-inner"><div className="hero-copy"><span className="hero-kicker">{copy.kicker}</span><h1>{copy.title}</h1><p>{copy.description}</p><PlatformChips locale={locale}/></div><div className="hero-art"><Image src="/images/hero-video-download.png" alt={copy.imageAlt} fill priority sizes="(max-width: 900px) 0px, 360px"/></div></div><div className="analyzer-shell"><UrlAnalyzer locale={locale} adsEnabled={adsEnabled}/></div></section><div className="content-shell"><FeatureCards locale={locale}/><AdSlot position="mid-article" locale={locale}/><PlatformStrip locale={locale}/><HowItWorks locale={locale}/><AdSlot position="end-article" locale={locale}/></div></main><Footer locale={locale}/><Script id={`video-downloader-structured-data-${locale}`} type="application/ld+json" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}/></>;
}
