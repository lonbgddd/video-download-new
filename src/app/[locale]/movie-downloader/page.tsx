import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MovieDownloader } from "@/features/movies/movie-downloader";
import { isLocale } from "@/config/i18n.config";
import { LOCALES } from "@/config/locales";
import { movieCopy } from "@/config/movie-content";

export function generateStaticParams() { return LOCALES.map((locale) => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = movieCopy(locale);
  return { title: copy.title, description: copy.description, alternates: { canonical: `/${locale}/movie-downloader`, languages: Object.fromEntries(LOCALES.map((code) => [code, `/${code}/movie-downloader`])) } };
}
export default async function MoviePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><Header locale={locale} activePage="movies"/><MovieDownloader locale={locale}/><Footer locale={locale}/></>;
}
