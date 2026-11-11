export type AnalyticsEvent = "paste_url" | "analyze_started" | "analyze_success" | "analyze_failed" | "format_selected" | "download_started" | "download_completed" | "download_failed";
export interface AnalyticsAdapter { track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void }
class ConsoleAnalyticsAdapter implements AnalyticsAdapter { track(event: AnalyticsEvent, properties = {}) { if (process.env.NODE_ENV === "development") console.info("[analytics]", event, properties); } }
export const analytics: AnalyticsAdapter = new ConsoleAnalyticsAdapter();
