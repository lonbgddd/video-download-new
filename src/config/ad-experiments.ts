export const AD_EXPERIMENT_PARAMETERS = {
  monetagVignette: "ads_monetag_vignette_enabled",
  monetagInPagePush: "ads_monetag_in_page_push_enabled",
  adcashInterstitial: "ads_adcash_interstitial_enabled",
  adsterraPopunder: "ads_adsterra_popunder_enabled",
  adsterraSocialBar: "ads_adsterra_social_bar_enabled",
  adsterraDisplay: "ads_adsterra_display_enabled",
  adsterraNative: "ads_adsterra_native_enabled",
} as const;

export const ADSTERRA_POPUNDER_VARIANT_PARAMETER =
  "ads_adsterra_popunder_variant";
export type AdsterraPopunderVariant = "existing" | "provided";

export type AdExperimentName = keyof typeof AD_EXPERIMENT_PARAMETERS;
export type AdExperimentFlags = Record<AdExperimentName, boolean>;
export type AdExperimentConfig = AdExperimentFlags & {
  adsterraPopunderVariant: AdsterraPopunderVariant;
};

export const DEFAULT_AD_EXPERIMENTS: AdExperimentFlags = {
  monetagVignette: true,
  monetagInPagePush: true,
  adcashInterstitial: true,
  adsterraPopunder: true,
  adsterraSocialBar: true,
  adsterraDisplay: true,
  adsterraNative: true,
};

export const DEFAULT_ADSTERRA_POPUNDER_VARIANT: AdsterraPopunderVariant =
  "existing";
