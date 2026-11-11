import path from "node:path";
import { createReadStream } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import type { StorageAdapter } from "./storage-adapter";
import { env } from "@/config/env";
import { AppError } from "@/lib/errors";

const safeId = /^[a-zA-Z0-9_-]{8,80}$/;
export function sanitizeFilename(value: string) {
  const cleaned = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._ -]+/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/-+(?=\.)/g, "").replace(/^[.-]+/, "").slice(0, 120);
  return cleaned || "download";
}

export class LocalStorageAdapter implements StorageAdapter {
  private ensureJobId(jobId: string) { if (!safeId.test(jobId)) throw new AppError("INVALID_URL", "Invalid job identifier"); }
  async createJobDirectory(jobId: string) { this.ensureJobId(jobId); const directory = path.join(env.TEMP_DIRECTORY, jobId); await mkdir(directory, { recursive: false, mode: 0o700 }); return directory; }
  resolveJobFile(jobId: string, fileName: string) { this.ensureJobId(jobId); return path.join(env.TEMP_DIRECTORY, jobId, sanitizeFilename(path.basename(fileName))); }
  async openReadStream(jobId: string, fileName: string) { const file = this.resolveJobFile(jobId, fileName); await stat(file); return createReadStream(file); }
  async removeJob(jobId: string) { this.ensureJobId(jobId); await rm(path.join(env.TEMP_DIRECTORY, jobId), { recursive: true, force: true }); }
  async cleanupExpired(olderThanMs: number) {
    await mkdir(env.TEMP_DIRECTORY, { recursive: true, mode: 0o700 });
    const now = Date.now(); let removed = 0;
    for (const entry of await readdir(env.TEMP_DIRECTORY, { withFileTypes: true })) {
      if (!entry.isDirectory() || !safeId.test(entry.name)) continue;
      const target = path.join(env.TEMP_DIRECTORY, entry.name);
      const info = await stat(target);
      if (now - info.mtimeMs > olderThanMs) { await rm(target, { recursive: true, force: true }); removed += 1; }
    }
    return removed;
  }
}

export const storageService = new LocalStorageAdapter();
