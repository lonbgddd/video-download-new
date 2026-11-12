import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  logEvent,
  setAnalyticsCollectionEnabled,
  type Analytics,
} from "firebase/analytics";
import {
  fetchAndActivate,
  getBoolean,
  getString,
  getRemoteConfig,
  isSupported as isRemoteConfigSupported,
} from "firebase/remote-config";
import {
  ADSTERRA_POPUNDER_VARIANT_PARAMETER,
  AD_EXPERIMENT_PARAMETERS,
  DEFAULT_ADSTERRA_POPUNDER_VARIANT,
  DEFAULT_AD_EXPERIMENTS,
  type AdExperimentConfig,
} from "@/config/ad-experiments";
import { hasAnalyticsConsent } from "@/privacy/consent-store";

const firebaseConfig = {
  apiKey: "AIzaSyAhJvugt8fLyxMzIQ9YIMPkO20LjFVJMW4",
  authDomain: "pdf-web-a8c52.firebaseapp.com",
  projectId: "pdf-web-a8c52",
  storageBucket: "pdf-web-a8c52.firebasestorage.app",
  messagingSenderId: "340895138437",
  appId: "1:340895138437:web:71cb41190646072dc95fec",
  measurementId: "G-CT33X6QTYH",
};

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

let analyticsPromise: Promise<Analytics | null> | undefined;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) {
    return null;
  }

  analyticsPromise ??= (async () => {
    if (!(await isAnalyticsSupported()) || !hasAnalyticsConsent()) return null;
    const analytics = getAnalytics(getFirebaseApp());
    await setAnalyticsCollectionEnabled(analytics, hasAnalyticsConsent());
    return analytics;
  })();

  try {
    const analytics = await analyticsPromise;
    if (!analytics) analyticsPromise = undefined;
    return analytics;
  } catch (error) {
    analyticsPromise = undefined;
    throw error;
  }
}

export function disableFirebaseAnalytics(): void {
  if (!analyticsPromise) return;
  void analyticsPromise.then((analytics) => {
    if (analytics) return setAnalyticsCollectionEnabled(analytics, false);
  }).catch((error: unknown) => {
    if (process.env.NODE_ENV === "development") {
      console.warn("Firebase Analytics could not be disabled.", error);
    }
  });
}

export async function trackFirebaseEvent(
  event: string,
  parameters?: Record<string, string | number | boolean>,
): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics || !hasAnalyticsConsent()) return;

  const eventParameters = parameters
    ? Object.fromEntries(
        Object.entries(parameters).map(([key, value]) => [
          key,
          typeof value === "boolean" ? Number(value) : value,
        ]),
      )
    : undefined;
  logEvent(analytics, event, eventParameters);
}

export async function fetchAdExperimentConfig(): Promise<AdExperimentConfig> {
  if (!(await isRemoteConfigSupported())) {
    throw new Error("Firebase Remote Config is not supported in this browser.");
  }
  if (!(await getFirebaseAnalytics())) {
    throw new Error("Firebase Analytics is unavailable or not consented.");
  }

  const remoteConfig = getRemoteConfig(getFirebaseApp());
  remoteConfig.defaultConfig = {
    [AD_EXPERIMENT_PARAMETERS.monetagVignette]:
      DEFAULT_AD_EXPERIMENTS.monetagVignette,
    [AD_EXPERIMENT_PARAMETERS.monetagInPagePush]:
      DEFAULT_AD_EXPERIMENTS.monetagInPagePush,
    [AD_EXPERIMENT_PARAMETERS.adcashInterstitial]:
      DEFAULT_AD_EXPERIMENTS.adcashInterstitial,
    [AD_EXPERIMENT_PARAMETERS.adsterraPopunder]:
      DEFAULT_AD_EXPERIMENTS.adsterraPopunder,
    [AD_EXPERIMENT_PARAMETERS.adsterraSocialBar]:
      DEFAULT_AD_EXPERIMENTS.adsterraSocialBar,
    [AD_EXPERIMENT_PARAMETERS.adsterraDisplay]:
      DEFAULT_AD_EXPERIMENTS.adsterraDisplay,
    [AD_EXPERIMENT_PARAMETERS.adsterraNative]:
      DEFAULT_AD_EXPERIMENTS.adsterraNative,
    [ADSTERRA_POPUNDER_VARIANT_PARAMETER]:
      DEFAULT_ADSTERRA_POPUNDER_VARIANT,
  };
  remoteConfig.settings = {
    fetchTimeoutMillis: 10_000,
    minimumFetchIntervalMillis:
      process.env.NODE_ENV === "development" ? 0 : 12 * 60 * 60 * 1000,
  };

  await fetchAndActivate(remoteConfig);
  const variant = getString(
    remoteConfig,
    ADSTERRA_POPUNDER_VARIANT_PARAMETER,
  );
  return {
    monetagVignette: getBoolean(
      remoteConfig,
      AD_EXPERIMENT_PARAMETERS.monetagVignette,
    ),
    monetagInPagePush: getBoolean(
      remoteConfig,
      AD_EXPERIMENT_PARAMETERS.monetagInPagePush,
    ),
    adcashInterstitial: getBoolean(
      remoteConfig,
      AD_EXPERIMENT_PARAMETERS.adcashInterstitial,
    ),
    adsterraPopunder: getBoolean(
      remoteConfig,
      AD_EXPERIMENT_PARAMETERS.adsterraPopunder,
    ),
    adsterraSocialBar: getBoolean(
      remoteConfig,
      AD_EXPERIMENT_PARAMETERS.adsterraSocialBar,
    ),
    adsterraDisplay: getBoolean(
      remoteConfig,
      AD_EXPERIMENT_PARAMETERS.adsterraDisplay,
    ),
    adsterraNative: getBoolean(
      remoteConfig,
      AD_EXPERIMENT_PARAMETERS.adsterraNative,
    ),
    adsterraPopunderVariant:
      variant === "provided" ? "provided" : "existing",
  };
}
