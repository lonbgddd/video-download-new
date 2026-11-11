# VideoDownloader

Ứng dụng Next.js production-oriented để phân tích URL media công khai, hiển thị metadata/format thực tế và tạo download job qua server. Dự án không vượt DRM, paywall, nội dung riêng tư, authentication hoặc các cơ chế kiểm soát truy cập.

## Yêu cầu

- Node.js 22+
- npm 10+
- FFmpeg/FFprobe cho các tác vụ media
- `yt-dlp[default]` và Node.js 22+ làm JavaScript runtime nếu muốn tải YouTube

Link trực tiếp tới `.mp4`, `.webm`, `.mov`, `.m4v`, `.mp3`, `.m4a`, `.ogg`, `.wav` hoạt động với extractor tích hợp sẵn. YouTube, Facebook, TikTok, Instagram, X, Vimeo, Dailymotion và Twitch cần `yt-dlp` trên PATH và chỉ dành cho nội dung công khai hợp lệ.

## Cài đặt và chạy local

```bash
cp .env.example .env
npm install
npm run dev
```

Mở `http://localhost:3000`. Cài FFmpeg trên macOS bằng `brew install ffmpeg`; cài yt-dlp kèm EJS bằng `python3 -m pip install -U "yt-dlp[default]"` (hoặc bản standalone chính thức). Ứng dụng dùng Node.js 22+ qua `--js-runtimes node` để xử lý challenge YouTube. Nếu binary nằm ngoài PATH, chỉnh `FFMPEG_PATH`, `FFPROBE_PATH`, `YT_DLP_PATH`.

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Docker

```bash
cp .env.example .env
docker compose up --build
```

Image production gồm Node, FFmpeg, FFprobe và yt-dlp; chạy bằng user không đặc quyền, root filesystem read-only và tmpfs riêng cho file tạm.

## Kiến trúc

- `src/app`: App Router, route handlers, SEO/robots/sitemap và các trang.
- `src/features/downloader`: analyzer, result, formats, modal tiến trình.
- `src/services/extractor`: `MediaExtractor`, direct extractor, yt-dlp adapter và registry.
- `src/services/media`: cache metadata và FFmpeg/FFprobe adapter.
- `src/services/jobs`: hàng đợi in-memory có concurrency limit, timeout, opaque token.
- `src/services/storage`: `StorageAdapter`, local temporary storage và cleanup.
- `src/services/security`: URL validation, DNS resolution và SSRF protection.
- `src/services/rate-limit`: rate limit in-memory.
- `src/services/analytics`: abstraction không phụ thuộc nhà cung cấp.

Route handler chỉ validate/điều phối. Business logic nằm trong service. MVP không cần database; production nhiều replica nên thay cache/job/rate-limit in-memory bằng Redis, và local storage bằng S3/R2-compatible adapter.

## Luồng xử lý

1. `POST /api/media/analyze` validate URL, chặn private IP sau DNS resolution, chọn extractor và cache metadata ngắn hạn.
2. UI chỉ hiển thị formats extractor trả về.
3. `POST /api/download` tạo job từ `mediaId` + `formatId`; client không truyền media URL hay filesystem path.
4. Worker in-process tải vào directory cô lập, kiểm tra giới hạn và phát opaque URL.
5. `GET /api/jobs/:id` trả trạng thái; UI polling với indeterminate progress khi backend không có phần trăm thật.
6. Download route stream file với `Content-Disposition`; cleanup xóa file hết hạn/orphan.

## Thêm extractor/platform

1. Implement `MediaExtractor` trong `src/services/extractor`.
2. `supports()` phải match hostname/path chặt chẽ.
3. Trả metadata và formats đã normalize; không trả command/path nội bộ.
4. Đăng ký extractor trong `extractor-registry.ts`.
5. Cập nhật `src/config/platforms.ts`; chỉ đặt `supported` khi backend hoạt động mặc định.
6. Thêm test valid, invalid, private/restricted, timeout và format unavailable.

## Biến môi trường

| Biến | Mặc định | Ý nghĩa |
|---|---:|---|
| `APP_URL` | `http://localhost:3000` | Canonical URL |
| `TEMP_DIRECTORY` | `/tmp/video-downloader` | Root file tạm |
| `MAX_MEDIA_DURATION` | `3600` | Thời lượng tối đa (giây) |
| `MAX_FILE_SIZE` | `1073741824` | Kích thước tối đa (byte) |
| `MAX_CONCURRENT_JOBS` | `3` | Số job chạy đồng thời |
| `DOWNLOAD_TIMEOUT` | `600000` | Timeout mỗi job (ms) |
| `JOB_TTL` | `1800` | Thời hạn job/file (giây) |
| `RATE_LIMIT_WINDOW` | `60000` | Cửa sổ rate limit (ms) |
| `RATE_LIMIT_MAX` | `20` | Request tối đa/cửa sổ/IP |
| `ADS_ENABLED` | `false` | Chuẩn bị slot quảng cáo server-side |
| `YT_DLP_PATH` | `yt-dlp` | Binary extractor |
| `FFMPEG_PATH` | `ffmpeg` | Binary FFmpeg |
| `FFPROBE_PATH` | `ffprobe` | Binary FFprobe |

## Bảo mật và giới hạn

- Chỉ HTTP(S); cấm credentials trong URL, localhost, private/link-local/metadata IP, `.local`/`.internal`; resolve DNS trước khi xử lý và kiểm tra lại redirect ở direct extractor.
- `spawn` dùng argument array, không nối shell command; filename được sanitize; mỗi job có directory riêng.
- MIME, size, duration, timeout, redirect, concurrency và request rate đều có giới hạn.
- Không log cookie, authorization hoặc URL đầy đủ chứa token.
- Rate limit/cache/job hiện là in-memory và không đồng bộ qua nhiều replica. Production nên dùng Redis/queue worker riêng.
- yt-dlp extractor phụ thuộc thay đổi của nguồn; trạng thái UI là Limited, không cam kết mọi URL hoạt động.
- Tiến trình là indeterminate nếu extractor không cung cấp telemetry; ứng dụng không tạo phần trăm giả.

## Triển khai production

Build Docker image và chạy sau reverse proxy TLS. Mount temp volume có quota hoặc giữ tmpfs; cấu hình egress firewall để tăng lớp SSRF protection; dùng Redis + worker queue cho nhiều replica; object storage cho file hoàn tất; log JSON vào hệ thống tập trung. Không triển khai lên serverless không có FFmpeg/process dài nếu chưa tách worker.

## Troubleshooting

- `spawn yt-dlp ENOENT`: cài yt-dlp hoặc sửa `YT_DLP_PATH`.
- `spawn ffmpeg ENOENT`: cài FFmpeg hoặc dùng Docker.
- URL trực tiếp bị từ chối: server nguồn phải trả MIME `video/*`/`audio/*`; hostname phải resolve tới public IP.
- Job biến mất khi restart: trạng thái MVP ở memory; bật Redis/queue trước khi chạy nhiều instance.
