"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_ADSTERRA_POPUNDER_VARIANT,
  DEFAULT_AD_EXPERIMENTS,
  type AdExperimentConfig,
} from "@/config/ad-experiments";
import { fetchAdExperimentConfig } from "@/lib/firebase";
import { useCookieConsent } from "@/privacy/consent-store";

type AdExperimentsContextValue = AdExperimentConfig & { ready: boolean };
type LoadedExperiments = {
  consentKey: string;
  config: AdExperimentConfig;
};

const AdExperimentsContext = createContext<AdExperimentsContextValue>({
  ...DEFAULT_AD_EXPERIMENTS,
  adsterraPopunderVariant: DEFAULT_ADSTERRA_POPUNDER_VARIANT,
  ready: true,
});

export function AdExperimentsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const consent = useCookieConsent();
  const analyticsConsent = consent?.analytics === true;
  const advertisingConsent = consent?.advertising === true;
  const consentKey = `${analyticsConsent}:${advertisingConsent}`;
  const [loaded, setLoaded] = useState<LoadedExperiments>();

  useEffect(() => {
    let active = true;
    if (!analyticsConsent || !advertisingConsent) {
      return () => {
        active = false;
      };
    }

    void fetchAdExperimentConfig()
      .then((config) => {
        if (active) setLoaded({ consentKey, config });
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("Firebase ad experiments could not be loaded.", error);
        }
        if (active) {
          setLoaded({
            consentKey,
            config: {
              ...DEFAULT_AD_EXPERIMENTS,
              adsterraPopunderVariant: DEFAULT_ADSTERRA_POPUNDER_VARIANT,
            },
          });
        }
      });

    return () => {
      active = false;
    };
  }, [analyticsConsent, advertisingConsent, consentKey]);

  const needsRemoteConfig = analyticsConsent && advertisingConsent;
  const ready =
    !needsRemoteConfig || loaded?.consentKey === consentKey;

  return (
    <AdExperimentsContext.Provider
      value={{
        ...(ready && loaded?.consentKey === consentKey
          ? loaded.config
          : {
              ...DEFAULT_AD_EXPERIMENTS,
              adsterraPopunderVariant: DEFAULT_ADSTERRA_POPUNDER_VARIANT,
            }),
        ready,
      }}
    >
      {children}
    </AdExperimentsContext.Provider>
  );
}

export function useAdExperiments(): AdExperimentsContextValue {
  return useContext(AdExperimentsContext);
}
