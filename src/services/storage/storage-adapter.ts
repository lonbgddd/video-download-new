import type { ReadStream } from "node:fs";

export interface StorageAdapter {
  createJobDirectory(jobId: string): Promise<string>;
  resolveJobFile(jobId: string, fileName: string): string;
  openReadStream(jobId: string, fileName: string): Promise<ReadStream>;
  removeJob(jobId: string): Promise<void>;
  cleanupExpired(olderThanMs: number): Promise<number>;
}
