import { randomBytes, randomUUID } from "node:crypto";
import { env } from "@/config/env";
import { mediaService } from "@/services/media/media-service";
import { storageService } from "@/services/storage/local-storage-adapter";
import { downloadService } from "@/services/media/download-service";
import type { DownloadJob, MediaKind } from "@/types/media";
import { AppError } from "@/lib/errors";

class JobService {
  private readonly jobs = new Map<string, DownloadJob>();
  private active = 0;
  private queue: string[] = [];

  constructor() {
    const timer = setInterval(() => void this.cleanup(), Math.min(env.JOB_TTL * 500, 300_000));
    timer.unref();
  }

  create(mediaId: string, formatId: string, type: MediaKind) {
    const media = mediaService.get(mediaId);
    const format = media.formats.find((item) => item.id === formatId);
    if (!format) throw new AppError("FORMAT_NOT_AVAILABLE", "Format unavailable");
    const now = Date.now(); const id = randomUUID();
    const job: DownloadJob = { id, mediaId, formatId, type, status: "queued", progress: null, message: "Đang chờ xử lý...", createdAt: now, updatedAt: now, expiresAt: now + env.JOB_TTL * 1000 };
    this.jobs.set(id, job); this.queue.push(id); void this.pump();
    return job;
  }

  get(id: string) { const job = this.jobs.get(id); if (!job) throw new AppError("MEDIA_NOT_FOUND", "Job not found", 404); return this.publicJob(job); }
  resolveDownload(id: string, token: string) {
    const job = this.jobs.get(id);
    if (!job || job.status !== "completed" || job.downloadToken !== token || !job.filePath || !job.fileName) throw new AppError("MEDIA_NOT_FOUND", "Download not found", 404);
    return job;
  }
  private publicJob(job: DownloadJob) { const safe = structuredClone(job); delete safe.filePath; delete safe.downloadToken; return { ...safe, downloadUrl: job.status === "completed" && job.downloadToken ? `/api/download/${job.id}?token=${encodeURIComponent(job.downloadToken)}` : undefined }; }
  private update(job: DownloadJob, patch: Partial<DownloadJob>) { Object.assign(job, patch, { updatedAt: Date.now() }); }

  private async pump() {
    while (this.active < env.MAX_CONCURRENT_JOBS && this.queue.length) {
      const id = this.queue.shift()!; const job = this.jobs.get(id); if (!job) continue;
      this.active += 1;
      void this.process(job).finally(() => { this.active -= 1; void this.pump(); });
    }
  }

  private async process(job: DownloadJob) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.DOWNLOAD_TIMEOUT);
    try {
      const media = mediaService.get(job.mediaId); const format = media.formats.find((item) => item.id === job.formatId)!;
      this.update(job, { status: "processing", progress: null, message: "Đang tải và xác thực dữ liệu..." });
      const prepared = await downloadService.prepare(media, format, job.id, controller.signal);
      this.update(job, { status: "completed", progress: 100, message: "File đã sẵn sàng.", fileName: prepared.fileName, filePath: prepared.filePath, mimeType: prepared.mimeType, downloadToken: randomBytes(32).toString("base64url") });
    } catch (error) {
      await storageService.removeJob(job.id).catch(() => undefined);
      console.error(JSON.stringify({ level: "error", jobId: job.id, status: "failed", code: error instanceof AppError ? error.code : "PROCESSING_FAILED", message: error instanceof Error ? error.message : "Unknown job error" }));
      this.update(job, { status: "failed", progress: null, message: error instanceof Error && error.name === "AbortError" ? "Quá trình xử lý đã hết thời gian." : "Không thể chuẩn bị file tải xuống.", error: error instanceof AppError ? error.code : "PROCESSING_FAILED" });
    } finally { clearTimeout(timeout); }
  }

  private async cleanup() {
    const now = Date.now();
    for (const [id, job] of this.jobs) if (job.expiresAt <= now) { this.update(job, { status: "expired", message: "File đã hết hạn." }); await storageService.removeJob(id).catch(() => undefined); this.jobs.delete(id); }
    await storageService.cleanupExpired(env.JOB_TTL * 1000).catch(() => undefined);
  }
}

const globalJobs = globalThis as typeof globalThis & { __jobService?: JobService };
export const jobService = globalJobs.__jobService ??= new JobService();
