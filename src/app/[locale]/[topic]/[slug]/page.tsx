import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { InternalLinkingWidget } from "@/components/navigation/InternalLinkingWidget";
import { LocaleTopicFooter, LocaleTopicHeader } from "@/components/navigation/LocaleTopicHeader";
import { AdSlot } from "@/components/ad-slot";
import { getLocalizedRoutes, type Locale } from "@/config/i18n.config";
import { UrlAnalyzer } from "@/features/downloader/url-analyzer";
import { generateLandingMetadata, getLocalizedRouteByParams } from "@/lib/seo/metadata";

interface LandingPageProps {
  params: Promise<{ locale: string; topic: string; slug: string }>;
}

const pageCopy: Record<Locale, { tool: string; benefits: string; checkLink: string; howItWorks: string }> = {
  en: { tool: "Try the tool", benefits: "Choose with the real format list", checkLink: "Check a media link", howItWorks: "How it works" },
  vi: { tool: "Dùng công cụ", benefits: "Chọn đúng định dạng ngay từ đầu", checkLink: "Kiểm tra link media", howItWorks: "Cách sử dụng" },
  es: { tool: "Probar la herramienta", benefits: "Elige con información real", checkLink: "Comprueba un enlace", howItWorks: "Cómo funciona" },
  ja: { tool: "ツールを使う", benefits: "形式を確認してから選択", checkLink: "リンクを確認する", howItWorks: "使い方" },
  fr: { tool: "Utiliser l’outil", benefits: "Choisissez parmi les formats disponibles", checkLink: "Vérifier un lien", howItWorks: "Mode d’emploi" },
  pt: { tool: "Usar a ferramenta", benefits: "Escolhe entre os formatos disponíveis", checkLink: "Verificar uma ligação", howItWorks: "Como funciona" },
  ko: { tool: "도구 사용하기", benefits: "제공 형식을 확인하고 선택하세요", checkLink: "미디어 링크 확인", howItWorks: "사용 방법" },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocalizedRoutes().map(({ locale, topic, slug }) => ({ locale, topic, slug }));
}

export async function generateMetadata({ params }: LandingPageProps): Promise<Metadata> {
  const { locale, topic, slug } = await params;
  const route = getLocalizedRouteByParams(locale, topic, slug);
  if (!route) notFound();
  return generateLandingMetadata(route);
}

export default async function LocalizedLandingPage({ params }: LandingPageProps) {
  const { locale, topic, slug } = await params;
  const route = getLocalizedRouteByParams(locale, topic, slug);
  if (!route) notFound();
  const copy = pageCopy[route.locale];
  const adsEnabled = process.env.ADS_ENABLED === "true";

  return (
    <>
      <LocaleTopicHeader locale={route.locale} currentPageId={route.page.id} />
      <main className="seo-main">
        <article className="seo-article">
          <header className="seo-hero">
            <p className="seo-eyebrow">{route.content.keywords.slice(0, 2).join(" · ")}</p>
            <h1>{route.content.heading}</h1>
            <p className="seo-lead">{route.content.intro}</p>
            <Link className="seo-primary-link" href="#download-tool">{copy.tool}</Link>
          </header>

          <section className="seo-section" aria-labelledby="seo-benefits-title">
            <h2 id="seo-benefits-title">
              {copy.benefits}
            </h2>
            <ul className="seo-benefits">
              {route.content.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
            </ul>
          </section>

          <section className="seo-tool-section" id="download-tool" aria-labelledby="seo-tool-title">
            <h2 id="seo-tool-title">
              {copy.checkLink}
            </h2>
            <UrlAnalyzer locale={route.locale} adsEnabled={adsEnabled} />
          </section>

          <section className="seo-section" aria-labelledby="seo-steps-title">
            <h2 id="seo-steps-title">
              {copy.howItWorks}
            </h2>
            <ol className="seo-steps">
              {route.content.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>

          <AdSlot position="mid-article" locale={route.locale} />

          <section className="seo-section seo-faq" aria-labelledby="seo-faq-title">
            <h2 id="seo-faq-title">FAQ</h2>
            {route.content.faqs.map(({ question, answer }) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </section>

          <InternalLinkingWidget route={route} />
          <AdSlot position="end-article" locale={route.locale} />
        </article>
      </main>
      <LocaleTopicFooter locale={route.locale} />
      <JsonLdSchema route={route} />
    </>
  );
}
