"use client";
import { useEffect, useState } from "react";
import type { DownloadJob } from "@/types/media";

type PublicJob = Omit<DownloadJob, "downloadToken"> & { downloadUrl?: string };

export function useDownloadJob(jobId?: string, fallbackError = "Không thể theo dõi tiến trình.") {
  const [job, setJob] = useState<PublicJob>(); const [error, setError] = useState<string>();
  useEffect(() => {
    if (!jobId) return;
    let active = true; let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" }); const payload = await response.json();
        if (!payload.success) throw new Error(payload.error.message);
        if (!active) return; setJob(payload.data.job);
        if (!["completed", "failed", "expired"].includes(payload.data.job.status)) timer = setTimeout(poll, 1000);
      } catch { if (active) setError(fallbackError); }
    };
    void poll(); return () => { active = false; clearTimeout(timer); };
  }, [fallbackError, jobId]);
  return { job, error };
}
