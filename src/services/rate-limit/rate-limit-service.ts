import { env } from "@/config/env";
import { AppError } from "@/lib/errors";

type Entry = { count: number; resetAt: number };

export class RateLimitService {
  private readonly entries = new Map<string, Entry>();
  check(key: string) {
    const now = Date.now();
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + env.RATE_LIMIT_WINDOW });
      return;
    }
    if (current.count >= env.RATE_LIMIT_MAX) throw new AppError("RATE_LIMIT", "Rate limit exceeded", 429);
    current.count += 1;
  }
}

export const rateLimitService = new RateLimitService();
