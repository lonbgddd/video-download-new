"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import type { Locale } from "@/config/locales";
import { CookiePreferences } from "@/components/privacy/cookie-preferences";
import { AdExperimentsProvider } from "@/components/ads/ad-experiments-provider";

export function Providers({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } }));
  return <ThemeProvider attribute="class" defaultTheme="light" enableSystem><QueryClientProvider client={client}><AdExperimentsProvider>{children}<CookiePreferences locale={locale}/></AdExperimentsProvider></QueryClientProvider></ThemeProvider>;
}
