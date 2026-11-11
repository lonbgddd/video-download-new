export const PRODUCTION_SITE_URL = "https://findtoolpdf.online";

export function getSiteUrl(
  configuredUrl: string | undefined = process.env.APP_URL,
  environment: string | undefined = process.env.NODE_ENV,
): URL {
  const hostname = configuredUrl ? new URL(configuredUrl).hostname.toLowerCase() : "";
  const isInternalHost =
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::" ||
    hostname === "[::]" ||
    hostname === "::1" ||
    hostname === "[::1]" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost");
  const url = environment === "production" && (!configuredUrl || isInternalHost)
    ? PRODUCTION_SITE_URL
    : configuredUrl ?? "http://localhost:3000";
  return new URL(url);
}
