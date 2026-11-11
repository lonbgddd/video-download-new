import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.string().url().default("http://localhost:3000"),
  TEMP_DIRECTORY: z.string().default("/tmp/video-downloader"),
  MAX_MEDIA_DURATION: z.coerce.number().int().positive().default(3600),
  MAX_FILE_SIZE: z.coerce.number().int().positive().default(1_073_741_824),
  MAX_CONCURRENT_JOBS: z.coerce.number().int().positive().default(3),
  DOWNLOAD_TIMEOUT: z.coerce.number().int().positive().default(600_000),
  JOB_TTL: z.coerce.number().int().positive().default(1800),
  RATE_LIMIT_WINDOW: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  ADS_ENABLED: z.enum(["true", "false"]).default("true"),
  YT_DLP_PATH: z.string().default("yt-dlp"),
  FFMPEG_PATH: z.string().default("ffmpeg"),
  FFPROBE_PATH: z.string().default("ffprobe"),
});

export const env = envSchema.parse(process.env);
