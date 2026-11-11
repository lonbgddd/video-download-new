"use client";
import { useEffect, useState } from "react";
import type { DownloadJob } from "@/types/media";

type PublicJob = Omit<DownloadJob, "filePath" | "downloadToken"> & { downloadUrl?: string };

export function useDownloadJob(jobId?: string) {
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
      } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "Không thể theo dõi tiến trình."); }
    };
    void poll(); return () => { active = false; clearTimeout(timer); };
  }, [jobId]);
  return { job, error };
}
