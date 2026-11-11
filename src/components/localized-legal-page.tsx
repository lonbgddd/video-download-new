import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { COOKIE_CONTENT } from "@/config/cookie-content";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_OPERATOR_NAME,
  LEGAL_POSTAL_ADDRESS,
} from "@/config/legal";
import { getLegalDocument, type LegalKind } from "@/config/legal-content";
import { HOME_PATHS, type Locale } from "@/config/locales";
import { CookiePreferencesButton } from "@/components/privacy/cookie-preferences";

const labels: Record<Locale, { back: string; updated: string; operator: string; contact: string; address: string; providers: string; references: string }> = {
  vi: { back: "Quay lại trang chủ", updated: "Có hiệu lực", operator: "Đơn vị vận hành / bên kiểm soát", contact: "Email quyền riêng tư", address: "Địa chỉ", providers: "Nhà cung cấp và thời hạn điển hình", references: "Tài liệu pháp lý tham khảo" },
  en: { back: "Back to home", updated: "Effective", operator: "Operator / controller", contact: "Privacy email", address: "Address", providers: "Providers and typical duration", references: "Regulatory references" },
  es: { back: "Volver al inicio", updated: "Vigente", operator: "Operador / responsable", contact: "Correo de privacidad", address: "Dirección", providers: "Proveedores y duración habitual", references: "Referencias normativas" },
  ja: { back: "ホームへ戻る", updated: "施行日", operator: "運営者・管理者", contact: "連絡先", address: "所在地", providers: "提供者と標準期間", references: "法的資料" },
  fr: { back: "Retour à l’accueil", updated: "En vigueur", operator: "Opérateur / responsable", contact: "E-mail confidentialité", address: "Adresse", providers: "Prestataires et durée habituelle", references: "Références réglementaires" },
  pt: { back: "Voltar ao início", updated: "Em vigor", operator: "Operador / responsável", contact: "Email de privacidade", address: "Morada", providers: "Fornecedores e duração típica", references: "Referências legais" },
  ko: { back: "홈으로", updated: "시행일", operator: "운영자·관리자", contact: "개인정보 이메일", address: "주소", providers: "제공업체 및 일반 기간", references: "법적 참고자료" },
};

export function LocalizedLegalPage({ locale, kind }: { locale: Locale; kind: LegalKind }) {
  const document = getLegalDocument(locale, kind);
  const text = labels[locale];
  const cookieCopy = COOKIE_CONTENT[locale];

  return (
    <main className="legal-page localized-legal-page">
      <Link className="brand" href={HOME_PATHS[locale]}><span className="brand-icon"><Download /></span>VideoDownloader</Link>
      <article>
        <Link className="back-link" href={HOME_PATHS[locale]}><ArrowLeft /> {text.back}</Link>
        <h1>{document.title}</h1>
        <p className="legal-summary">{document.summary}</p>
        <nav className="legal-document-nav" aria-label={document.title}>
          <Link href={`/${locale}/privacy`}>{cookieCopy.privacy}</Link>
          <Link href={`/${locale}/cookies`}>{cookieCopy.cookiePolicy}</Link>
          <Link href={`/${locale}/terms`}>{cookieCopy.terms}</Link>
          <CookiePreferencesButton locale={locale} />
        </nav>
        <section className="legal-controller" aria-label={text.operator}>
          <p><strong>{text.operator}:</strong> {LEGAL_OPERATOR_NAME}</p>
          <p><strong>{text.contact}:</strong> <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a></p>
          <p><strong>{text.address}:</strong> {LEGAL_POSTAL_ADDRESS}</p>
        </section>
        {document.sections.map((section) => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
        {kind === "cookies" && (
          <section>
            <h2>{text.providers}</h2>
            <div className="legal-table-wrap"><table><thead><tr><th>Provider</th><th>Category</th><th>Typical duration</th></tr></thead><tbody>
              <tr><td>VideoDownloader — vd_cookie_consent</td><td>Necessary</td><td>180 days</td></tr>
              <tr><td>Google Analytics — _ga, _ga_*</td><td>Analytics</td><td>Up to 2 years</td></tr>
              <tr><td>Adsterra / demand partners</td><td>Advertising</td><td>Session to provider-defined persistent periods</td></tr>
              <tr><td>Adcash</td><td>Advertising</td><td>Session or provider-defined persistent periods</td></tr>
              <tr><td>Monetag</td><td>Advertising</td><td>Provider-defined; see provider policy</td></tr>
            </tbody></table></div>
          </section>
        )}
        <section>
          <h2>{text.references}</h2>
          <ul className="legal-reference-list">
            <li><a href="https://commission.europa.eu/law/law-topic/data-protection/information-individuals_en" target="_blank" rel="noreferrer">European Commission — data protection rights</a></li>
            <li><a href="https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en" target="_blank" rel="noreferrer">EDPB — consent guidelines</a></li>
            <li><a href="https://oag.ca.gov/privacy/ccpa" target="_blank" rel="noreferrer">California Attorney General — CCPA rights</a></li>
            <li><a href="https://english.luatvietnam.vn/dan-su/law-on-personal-data-protection-law-no-91-2025-qh15-405135-d1.html" target="_blank" rel="noreferrer">Vietnam Law on Personal Data Protection No. 91/2025/QH15</a></li>
          </ul>
        </section>
        <p className="legal-updated">{text.updated}: {LEGAL_EFFECTIVE_DATE}</p>
      </article>
    </main>
  );
}
