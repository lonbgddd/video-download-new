import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedLegalPage } from "@/components/localized-legal-page";
import { getLegalDocument } from "@/config/legal-content";
import { isLocale, LOCALES } from "@/config/i18n.config";

export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { const { locale } = await params; if (!isLocale(locale)) notFound(); const doc = getLegalDocument(locale, "terms"); return { title: doc.title, description: doc.summary, alternates: { canonical: `/${locale}/terms`, languages: Object.fromEntries(LOCALES.map((code) => [code, `/${code}/terms`])) } }; }
export default async function Page({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <LocalizedLegalPage locale={locale} kind="terms"/>; }
