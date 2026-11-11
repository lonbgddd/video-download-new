# VideoDownloader

Ứng dụng Next.js production-oriented để phân tích URL media công khai, hiển thị metadata/format thực tế và tạo download job qua server. Dự án không vượt DRM, paywall, nội dung riêng tư, authentication hoặc các cơ chế kiểm soát truy cập.

## Yêu cầu

- Node.js 22+
- npm 10+
- FFmpeg/FFprobe cho các tác vụ media
- `yt-dlp[default]` và Node.js 22+ làm JavaScript runtime nếu muốn tải YouTube

Link trực tiếp tới `.mp4`, `.webm`, `.mov`, `.m4v`, `.mp3`, `.m4a`, `.ogg`, `.wav` hoạt động với extractor tích hợp sẵn. YouTube, Facebook, TikTok, Instagram, X, Vimeo, Dailymotion, Twitch, Reddit, SoundCloud, Pinterest và Bilibili cần `yt-dlp` trên PATH và chỉ dành cho nội dung công khai hợp lệ. Danh sách domain được allowlist rõ ràng để giữ URL validation/SSRF protection; không tự động bật mọi website mà yt-dlp có thể nhận diện.

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

Image production gồm Node, FFmpeg, FFprobe và yt-dlp; chạy bằng user không đặc quyền và root filesystem read-only. Luồng tải hiện tại không lưu media thành file trên server.

## Kiến trúc

- `src/app`: App Router, route handlers, SEO/robots/sitemap và các trang.
- `src/app/[locale]/[topic]/[slug]`: landing page SEO đa ngôn ngữ, prerender từ catalog nội dung.
- `src/config/locales.ts`: bảy locale và thông tin ngôn ngữ dùng chung.
- `src/config/i18n.config.ts`: route, nội dung landing page biên tập và các helper đa ngôn ngữ.
- `src/config/programmatic-seo.ts`: ma trận 25 chủ đề nội dung × 20 nhu cầu sử dụng, được transcreate riêng cho từng locale để tạo 500 trang mới.
- `src/lib/seo/metadata.ts`: canonical, hreflang, OpenGraph và Twitter metadata.
- `src/components/seo/JsonLdSchema.tsx`: structured data dùng kiểu `schema-dts`.
- `src/components/navigation`: menu theo chủ đề, chọn ngôn ngữ và liên kết nội bộ cùng locale.
- `src/features/downloader`: analyzer, result, formats, modal tiến trình.
- `src/services/extractor`: `MediaExtractor`, direct extractor, yt-dlp adapter và registry.
- `src/services/media`: cache metadata và FFmpeg/FFprobe adapter.
- `src/services/jobs`: download ticket in-memory có thời hạn và opaque token.
- `src/services/storage`: adapter lưu file cục bộ cũ; luồng tải hiện tại không dùng adapter này.
- `src/services/security`: URL validation, DNS resolution và SSRF protection.
- `src/services/rate-limit`: rate limit in-memory.
- `src/services/analytics`: abstraction không phụ thuộc nhà cung cấp.

Route handler chỉ validate/điều phối. Business logic nằm trong service. MVP không cần database; production nhiều replica nên thay cache/ticket/rate-limit in-memory bằng Redis.

## SEO đa ngôn ngữ

Site hiện có 7 locale: tiếng Anh, Việt, Tây Ban Nha, Nhật, Pháp, Bồ Đào Nha (Portugal) và Hàn. Có 3 landing page nền cùng 500 chủ đề mới; mỗi chủ đề có URL và nội dung bản địa hóa ở cả 7 locale (tổng cộng 3.521 route landing page). Sitemap còn liệt kê 5 trang chung.

Các chủ đề mới kết hợp 25 loại media với 20 nhu cầu sử dụng thực tế. Bản dịch dùng cụm từ, tiêu đề, mô tả và hướng dẫn riêng theo locale; nội dung luôn nói rõ định dạng phụ thuộc nguồn và không khẳng định mọi liên kết đều hoạt động. Ví dụ:

- `/en/video-downloader/youtube-video-to-mp4`
- `/vi/cong-cu-tai-video/tai-video-youtube-dinh-dang-mp4`
- `/es/descargar-videos/youtube-a-mp4-video-publico`
- `/ja/douga-download/youtube-koukai-douga-mp4`
- `/fr/telecharger-videos/enregistrer-video-publique`
- `/pt/baixar-videos/guardar-video-publico-no-navegador`
- `/ko/video-download/gonggae-dongyeongsang-jeojang`

Để thêm trang biên tập, bổ sung nội dung đã rà soát cho cả bảy locale trong `src/config/i18n.config.ts`. Khi mở rộng ma trận programmatic, chỉ thêm chủ đề/nội dung có ích và xác minh slug không trùng trong cùng locale. Các route được đưa vào static params, sitemap/hreflang, metadata và structured data; menu và liên kết liên quan chỉ hiển thị một tập con để tránh danh sách quá dài. Trước khi triển khai, rà soát chất lượng bản địa hóa và đặt `APP_URL` thành domain production để canonical, OpenGraph và sitemap chính xác.

## Vị trí quảng cáo

Quảng cáo tắt mặc định; đặt `ADS_ENABLED=true` để bật các script mạng đã cấu hình. Các vị trí Native riêng gồm: banner nhỏ phía trên header, hai rail chỉ trên màn hình rất rộng (từ 1800 px), slot dưới ô nhập link, slot trong dialog tải và Native cuối bài. Mỗi slot mới chỉ tải khi gần vùng nhìn thấy (`IntersectionObserver`) và cần một cặp URL script/container ID riêng; không sao chép container của một zone vào nhiều vị trí. Nếu chưa cấu hình cặp riêng, vị trí đó sẽ không render. `NEXT_PUBLIC_ADSTERRA_*` được nhúng vào client build và không phải nơi đặt secret.

Social Bar/Monetag ở giữa bài và Native cuối bài giữ nguyên vị trí hiện tại. Slot trong dialog nằm dưới trạng thái/nút tải và chỉ tải khi dialog mở; hộp thoại có thể cuộn để nút đóng và nội dung vẫn truy cập được. Các slot giữ chiều cao dự kiến để hạn chế layout shift. Kiểm tra lại trên thiết bị thật, consent/cookie policy, Core Web Vitals và chính sách của nhà cung cấp trước khi phát hành.

Pop-under hiện dùng khóa `localStorage` để giới hạn một lần trong 24 giờ trên mỗi trình duyệt; chế độ riêng tư hoặc khi storage không khả dụng sẽ không bật pop-under để tránh tần suất không kiểm soát. Social Bar, Native Banner và Monetag zone `308758` dùng cấu hình trong `src/config/ad-networks.ts`. Script Monetag chỉ được tải khi cuộn tới vị trí giữa nội dung (`IntersectionObserver`, vùng đệm 250 px). Không bật đồng thời auto-placement bên ngoài các slot này nếu cần giữ nguyên vị trí và UX đã mô tả. Các mạng quảng cáo có thể thay đổi creative hoặc hành vi hiển thị; kiểm tra lại trên thiết bị thật, consent/cookie policy, Core Web Vitals và chính sách của nhà cung cấp trước khi phát hành.

Với Next.js, `ADS_ENABLED` được đọc khi prerender các trang. Khi dùng Docker Compose, chạy lại `docker compose up --build` sau khi đặt biến trong `.env`; với hosting CI/CD, truyền biến này vào cả bước build image lẫn runtime. Khi chạy `npm run dev`, khởi động lại dev server sau khi đổi `.env`.

## Luồng xử lý

1. `POST /api/media/analyze` validate URL, chặn private IP sau DNS resolution, chọn extractor và cache metadata ngắn hạn.
2. UI chỉ hiển thị formats extractor trả về.
3. Client gửi `mediaId` + `formatId`; không gửi media URL hay filesystem path.
4. `POST /api/download` tạo ticket có thời hạn; chưa tải media và không ghi file xuống ổ đĩa server.
5. Khi người dùng bấm tải, `GET /api/download/:id` stream dữ liệu nguồn tới trình duyệt với `Content-Disposition`; giới hạn kích thước được kiểm tra trong lúc truyền.
6. Stream đi qua server nên server vẫn dùng băng thông và xử lý media, nhưng không lưu bản tải xuống thành file tạm.
7. Video dài hơn `MAX_MEDIA_DURATION`, hoặc một nền tảng yt-dlp được allowlist không phân tích được vì lỗi extractor phù hợp, có nút dự phòng để lấy luồng media tốt nhất và mở ở tab mới; sau khi lấy URL, media không đi qua server và link có thể hết hạn hoặc chỉ phát inline. Với SoundCloud hoặc nguồn audio, tab sẽ mở audio thay vì video.

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
| `MAX_MEDIA_DURATION` | `3600` | Thời lượng tối đa (giây) |
| `MAX_FILE_SIZE` | `1073741824` | Kích thước tối đa (byte) |
| `MAX_CONCURRENT_JOBS` | `3` | Số luồng tải đồng thời |
| `DOWNLOAD_TIMEOUT` | `600000` | Timeout mỗi luồng tải (ms) |
| `JOB_TTL` | `1800` | Thời hạn ticket tải (giây) |
| `RATE_LIMIT_WINDOW` | `60000` | Cửa sổ rate limit (ms) |
| `RATE_LIMIT_MAX` | `20` | Request tối đa/cửa sổ/IP |
| `ADS_ENABLED` | `false` | Bật/tắt quảng cáo; đặt `true` trước khi build và khi chạy production |
| `NEXT_PUBLIC_ADSTERRA_HEADER_SCRIPT_URL` / `NEXT_PUBLIC_ADSTERRA_HEADER_CONTAINER_ID` | trống | Zone Native riêng phía trên header |
| `NEXT_PUBLIC_ADSTERRA_LEFT_RAIL_SCRIPT_URL` / `NEXT_PUBLIC_ADSTERRA_LEFT_RAIL_CONTAINER_ID` | trống | Zone Native riêng bên trái, chỉ màn hình từ 1800 px |
| `NEXT_PUBLIC_ADSTERRA_RIGHT_RAIL_SCRIPT_URL` / `NEXT_PUBLIC_ADSTERRA_RIGHT_RAIL_CONTAINER_ID` | trống | Zone Native riêng bên phải, chỉ màn hình từ 1800 px |
| `NEXT_PUBLIC_ADSTERRA_INPUT_SCRIPT_URL` / `NEXT_PUBLIC_ADSTERRA_INPUT_CONTAINER_ID` | trống | Zone Native riêng dưới ô nhập link |
| `NEXT_PUBLIC_ADSTERRA_DOWNLOAD_MODAL_SCRIPT_URL` / `NEXT_PUBLIC_ADSTERRA_DOWNLOAD_MODAL_CONTAINER_ID` | trống | Zone Native riêng trong dialog tải |
| `YT_DLP_PATH` | `yt-dlp` | Binary extractor |
| `FFMPEG_PATH` | `ffmpeg` | Binary FFmpeg |
| `FFPROBE_PATH` | `ffprobe` | Binary FFprobe |

## Bảo mật và giới hạn

- Chỉ HTTP(S); cấm credentials trong URL, localhost, private/link-local/metadata IP, `.local`/`.internal`; resolve DNS trước khi xử lý và kiểm tra lại redirect ở direct extractor.
- `spawn` dùng argument array, không nối shell command; filename được sanitize; tải xuống được stream và giới hạn kích thước.
- MIME, size, duration, timeout, redirect, concurrency và request rate đều có giới hạn.
- Không log cookie, authorization hoặc URL đầy đủ chứa token.
- Rate limit/cache/job hiện là in-memory và không đồng bộ qua nhiều replica. Production nên dùng Redis/queue worker riêng.
- yt-dlp extractor phụ thuộc thay đổi của nguồn; trạng thái UI là Limited, không cam kết mọi URL hoạt động.
- Link dự phòng chỉ áp dụng cho nền tảng yt-dlp trong allowlist; nguồn phải cung cấp một luồng media đơn và URL tạm có thể hết hạn.
- Tiến trình là indeterminate nếu extractor không cung cấp telemetry; ứng dụng không tạo phần trăm giả.

## Triển khai production

Build Docker image và chạy sau reverse proxy TLS. Mount temp volume có quota hoặc giữ tmpfs; cấu hình egress firewall để tăng lớp SSRF protection; dùng Redis + worker queue cho nhiều replica; object storage cho file hoàn tất; log JSON vào hệ thống tập trung. Không triển khai lên serverless không có FFmpeg/process dài nếu chưa tách worker.

## Troubleshooting

- `spawn yt-dlp ENOENT`: cài yt-dlp hoặc sửa `YT_DLP_PATH`.
- `spawn ffmpeg ENOENT`: cài FFmpeg hoặc dùng Docker.
- URL trực tiếp bị từ chối: server nguồn phải trả MIME `video/*`/`audio/*`; hostname phải resolve tới public IP.
- Job biến mất khi restart: trạng thái MVP ở memory; bật Redis/queue trước khi chạy nhiều instance.
