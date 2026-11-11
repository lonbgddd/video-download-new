"use client";
import { useMutation } from "@tanstack/react-query";
import { ApiRequestError, type ApiResponse } from "@/types/api";
import type { MediaMetadata } from "@/types/media";
import { analytics } from "@/services/analytics/analytics-adapter";

export function useMediaAnalyzer() {
  return useMutation({
    mutationFn: async (url: string) => {
      analytics.track("analyze_started");
      const response = await fetch("/api/media/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const payload = await response.json() as ApiResponse<{ media: MediaMetadata }>;
      if (!payload.success) throw new ApiRequestError(payload.error.code, payload.error.message);
      return payload.data.media;
    },
    onSuccess: (media) => analytics.track("analyze_success", { platform: media.platform }),
    onError: () => analytics.track("analyze_failed"),
  });
}
