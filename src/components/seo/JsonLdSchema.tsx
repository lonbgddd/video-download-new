import type { FAQPage, Graph, HowTo, SoftwareApplication, WebPage } from "schema-dts";
import { getAbsoluteUrl, getLocalizedPath } from "@/lib/seo/metadata";
import { SITE_NAME, type LocalizedRoute } from "@/config/i18n.config";

export function JsonLdSchema({ route }: { route: LocalizedRoute }) {
  const pageUrl = getAbsoluteUrl(getLocalizedPath(route));
  const application: SoftwareApplication = {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: route.page.category === "audio" ? "MultimediaApplication" : "VideoApplication",
    operatingSystem: "Web",
    inLanguage: route.locale,
    url: getAbsoluteUrl("/"),
    description: route.content.description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const howTo: HowTo = {
    "@type": "HowTo",
    name: route.content.heading,
    description: route.content.description,
    inLanguage: route.locale,
    step: route.content.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: text,
      text,
      url: pageUrl,
    })),
  };
  const webPage: WebPage = {
    "@type": "WebPage",
    name: route.content.title,
    description: route.content.description,
    url: pageUrl,
    inLanguage: route.locale,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: getAbsoluteUrl("/") },
    mainEntity: { "@id": `${pageUrl}#application` },
  };
  const faqPage: FAQPage = {
    "@type": "FAQPage",
    mainEntity: route.content.faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const graph: Graph = {
    "@context": "https://schema.org",
    "@graph": [
      { ...application, "@id": `${pageUrl}#application` },
      howTo,
      webPage,
      faqPage,
    ],
  };
  const serialized = JSON.stringify(graph).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}
