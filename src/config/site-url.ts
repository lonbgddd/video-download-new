export const PRODUCTION_SITE_URL = "https://findtoolpdf.online";

export function getSiteUrl(
  configuredUrl: string | undefined = process.env.APP_URL,
  environment: string | undefined = process.env.NODE_ENV,
): URL {
  const isLocalhost = configuredUrl ? new URL(configuredUrl).hostname === "localhost" : false;
  const url = environment === "production" && (!configuredUrl || isLocalhost)
    ? PRODUCTION_SITE_URL
    : configuredUrl ?? "http://localhost:3000";
  return new URL(url);
}
