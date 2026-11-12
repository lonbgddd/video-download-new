import { trackFirebaseEvent } from "@/lib/firebase";
import { hasAnalyticsConsent } from "@/privacy/consent-store";

export type AnalyticsEvent = "paste_url" | "analyze_started" | "analyze_success" | "analyze_failed" | "format_selected" | "download_started" | "download_completed" | "download_failed";
export interface AnalyticsAdapter { track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void }
class FirebaseAnalyticsAdapter implements AnalyticsAdapter {
  track(event: AnalyticsEvent, properties = {}) {
    if (process.env.NODE_ENV === "development") console.info("[analytics]", event, properties);
    if (!hasAnalyticsConsent()) return;
    void trackFirebaseEvent(event, properties).catch((error: unknown) => {
      if (process.env.NODE_ENV === "development") {
        console.warn("Firebase Analytics event could not be recorded.", error);
      }
    });
  }
}
export const analytics: AnalyticsAdapter = new FirebaseAnalyticsAdapter();
