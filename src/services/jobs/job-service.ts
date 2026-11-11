import { randomBytes, randomUUID } from "node:crypto";
import { env } from "@/config/env";
import { mediaService } from "@/services/media/media-service";
import type { DownloadJob, MediaKind } from "@/types/media";
import { AppError } from "@/lib/errors";

class JobService {
  private readonly jobs = new Map<string, DownloadJob>();

  constructor() {
    const timer = setInterval(() => void this.cleanup(), Math.min(env.JOB_TTL * 500, 300_000));
    timer.unref();
  }

  create(mediaId: string, formatId: string, type: MediaKind) {
    const media = mediaService.get(mediaId);
    const format = media.formats.find((item) => item.id === formatId);
    if (!format) throw new AppError("FORMAT_NOT_AVAILABLE", "Format unavailable");
    const now = Date.now(); const id = randomUUID();
    const job: DownloadJob = {
      id, mediaId, formatId, type, status: "completed", progress: 100,
      message: "File đã sẵn sàng để truyền trực tiếp.", createdAt: now, updatedAt: now,
      expiresAt: now + env.JOB_TTL * 1000, downloadToken: randomBytes(32).toString("base64url"),
    };
    this.jobs.set(id, job);
    return job;
  }

  get(id: string) { const job = this.jobs.get(id); if (!job || job.expiresAt <= Date.now()) throw new AppError("MEDIA_NOT_FOUND", "Job not found", 404); return this.publicJob(job); }
  resolveDownload(id: string, token: string) {
    const job = this.jobs.get(id);
    if (!job || job.expiresAt <= Date.now() || job.status !== "completed" || job.downloadToken !== token) throw new AppError("MEDIA_NOT_FOUND", "Download not found", 404);
    return job;
  }
  private publicJob(job: DownloadJob) { const safe = structuredClone(job); delete safe.downloadToken; return { ...safe, downloadUrl: job.status === "completed" && job.downloadToken ? `/api/download/${job.id}?token=${encodeURIComponent(job.downloadToken)}` : undefined }; }

  private cleanup() {
    const now = Date.now();
    for (const [id, job] of this.jobs) if (job.expiresAt <= now) this.jobs.delete(id);
  }
}

const globalJobs = globalThis as typeof globalThis & { __jobService?: JobService };
export const jobService = globalJobs.__jobService ??= new JobService();
