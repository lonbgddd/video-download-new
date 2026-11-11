export const ADSTERRA_POPUNDER_SCRIPT_URL =
  "https://accountut.com/1/a4be5218e45b057562b69445b99f1ac4";

export const ADSTERRA_SOCIAL_BAR_SCRIPT_URL =
  "https://bellnewyork.org/14/e610823fdbcc72810925b59dad596b8e";

export const ADSTERRA_NATIVE_SCRIPT_URL =
  "https://bellnewyork.org/21/d468e51617172660732a1ebb7c995bcf";

export const ADSTERRA_NATIVE_CONTAINER_ID =
  "container-d468e51617172660732a1ebb7c995bcf";

export type AdsterraNativePlacement =
  | "end-article"
  | "above-header"
  | "side-left"
  | "side-right"
  | "near-input"
  | "download-modal";

type AdsterraNativeUnit = {
  scriptUrl: string;
  containerId: string;
};

const ADSTERRA_NATIVE_PLACEMENTS: Record<
  AdsterraNativePlacement,
  AdsterraNativeUnit | undefined
> = {
  "end-article": {
    scriptUrl: ADSTERRA_NATIVE_SCRIPT_URL,
    containerId: ADSTERRA_NATIVE_CONTAINER_ID,
  },
  "above-header": getOptionalNativeUnit(
    process.env.NEXT_PUBLIC_ADSTERRA_HEADER_SCRIPT_URL,
    process.env.NEXT_PUBLIC_ADSTERRA_HEADER_CONTAINER_ID,
  ),
  "side-left": getOptionalNativeUnit(
    process.env.NEXT_PUBLIC_ADSTERRA_LEFT_RAIL_SCRIPT_URL,
    process.env.NEXT_PUBLIC_ADSTERRA_LEFT_RAIL_CONTAINER_ID,
  ),
  "side-right": getOptionalNativeUnit(
    process.env.NEXT_PUBLIC_ADSTERRA_RIGHT_RAIL_SCRIPT_URL,
    process.env.NEXT_PUBLIC_ADSTERRA_RIGHT_RAIL_CONTAINER_ID,
  ),
  "near-input": getOptionalNativeUnit(
    process.env.NEXT_PUBLIC_ADSTERRA_INPUT_SCRIPT_URL,
    process.env.NEXT_PUBLIC_ADSTERRA_INPUT_CONTAINER_ID,
  ),
  "download-modal": getOptionalNativeUnit(
    process.env.NEXT_PUBLIC_ADSTERRA_DOWNLOAD_MODAL_SCRIPT_URL,
    process.env.NEXT_PUBLIC_ADSTERRA_DOWNLOAD_MODAL_CONTAINER_ID,
  ),
};

function getOptionalNativeUnit(
  scriptUrl: string | undefined,
  containerId: string | undefined,
): AdsterraNativeUnit | undefined {
  return scriptUrl && containerId ? { scriptUrl, containerId } : undefined;
}

export function getAdsterraNativeUnit(
  placement: AdsterraNativePlacement,
): AdsterraNativeUnit | undefined {
  return ADSTERRA_NATIVE_PLACEMENTS[placement];
}

// Monetag Vignette: replace these NEXT_PUBLIC_* values when the production
// Vignette zone or script host changes. Zone IDs are public ad identifiers.
export const MONETAG_VIGNETTE_SCRIPT_URL =
  process.env.NEXT_PUBLIC_MONETAG_VIGNETTE_SCRIPT_URL ??
  "https://n6wxm.com/vignette.min.js";
export const MONETAG_VIGNETTE_ZONE_ID =
  process.env.NEXT_PUBLIC_MONETAG_VIGNETTE_ZONE_ID ?? "12238810";

// Monetag In-Page Push: replace these NEXT_PUBLIC_* values with the matching
// script and zone generated in the Monetag dashboard.
export const MONETAG_IN_PAGE_PUSH_SCRIPT_URL =
  process.env.NEXT_PUBLIC_MONETAG_IN_PAGE_PUSH_SCRIPT_URL ??
  "https://nap5k.com/tag.min.js";
export const MONETAG_IN_PAGE_PUSH_ZONE_ID =
  process.env.NEXT_PUBLIC_MONETAG_IN_PAGE_PUSH_ZONE_ID ?? "12238840";

export const ADCASH_LIBRARY_SCRIPT_URL = "https://acscdn.com/script/aclib.js";

// Adcash Interstitial: replace this public zone ID when rotating the
// Interstitial zone in Adcash. The trigger remains centralized and throttled.
export const ADCASH_INTERSTITIAL_ZONE_ID =
  process.env.NEXT_PUBLIC_ADCASH_INTERSTITIAL_ZONE_ID ?? "12435318";

export const ADCASH_INTERSTITIAL_MIN_INTERVAL_MS = 30_000;

export const ADSTERRA_POPUNDER_STORAGE_KEY =
  "video-downloader:adsterra-popunder:last-shown-at";

export const ADSTERRA_POPUNDER_INTERVAL_MS = 24 * 60 * 60 * 1000;
