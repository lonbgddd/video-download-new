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

Quảng cáo bật mặc định; đặt `ADS_ENABLED=false` để tắt toàn bộ mạng quảng cáo. Monetag In-Page Push (`12238840`) được nạp toàn site bằng `next/script` với `afterInteractive`; Monetag Vignette (`12238810`) chỉ mount khi dialog tải xuống mở. Adcash Interstitial (`12435318`) được nạp một lần và kích hoạt từ thao tác Analyze/Download, có throttle 30 giây để tránh hiển thị lặp liên tiếp.

Các vị trí Display gắn cứng gồm: `468×60` phía trên header, `160×300` ở hai rail từ 1280 px, `320×50` dưới ô nhập link và `300×250` trong dialog tải; Native cuối bài vẫn dùng zone riêng. Mỗi tag Display chạy trong iframe cô lập để các biến `atOptions` không ghi đè nhau. Các slot giữ sẵn kích thước để tránh layout shift và chỉ mount phía client.

Social Bar ở giữa bài và Native cuối bài giữ nguyên vị trí hiện tại. Slot Native tùy chọn trong dialog nằm dưới trạng thái/nút tải; Monetag Vignette được mount cùng trạng thái mở của dialog. Hộp thoại có thể cuộn để nút đóng và nội dung vẫn truy cập được. Kiểm tra lại trên thiết bị thật, consent/cookie policy, Core Web Vitals và chính sách của nhà cung cấp trước khi phát hành.

Pop-under hiện dùng khóa `localStorage` để giới hạn một lần trong 24 giờ trên mỗi trình duyệt; chế độ riêng tư hoặc khi storage không khả dụng sẽ không bật pop-under để tránh tần suất không kiểm soát. Không bật thêm auto-placement ngoài các loader/slot đã khai báo nếu cần giữ nguyên tần suất và UX. Các mạng quảng cáo có thể thay đổi creative hoặc hành vi hiển thị; kiểm tra lại trên thiết bị thật trước khi phát hành.

Firebase Analytics và toàn bộ quảng cáo bị chặn mặc định cho đến khi người dùng đồng ý đúng nhóm trong Cookie Preferences. Lựa chọn được lưu 180 ngày; người dùng có thể đổi/rút lại từ footer và Global Privacy Control luôn tắt quảng cáo theo dõi. Với Next.js, `ADS_ENABLED` được đọc khi prerender; thay biến build-time cần build/restart lại ứng dụng.

### Thử nghiệm A/B cho quảng cáo

Firebase Remote Config được tải sau khi người dùng đồng ý cả Analytics và quảng cáo. Trong Firebase Console, tạo các parameter kiểu Boolean dưới đây (default `true`), sau đó tạo một A/B test riêng cho parameter cần đo. Dùng `true` cho control (giữ định dạng quảng cáo) và `false` cho variant (tắt riêng định dạng đó):

| Remote Config parameter | Định dạng |
|---|---|
| `ads_monetag_vignette_enabled` | Monetag Vignette trong dialog tải |
| `ads_monetag_in_page_push_enabled` | Monetag In-Page Push |
| `ads_adcash_interstitial_enabled` | Adcash Interstitial |
| `ads_adsterra_popunder_enabled` | Adsterra Pop-under |
| `ads_adsterra_social_bar_enabled` | Adsterra Social Bar |
| `ads_adsterra_display_enabled` | Các banner Display cố định |
| `ads_adsterra_native_enabled` | Các vị trí Native |

Firebase tự ghi nhận nhóm experiment khi Remote Config được kích hoạt. Có thể chọn `analyze_success` hoặc `download_completed` làm conversion event; các event này chỉ được gửi khi người dùng đã cho phép Analytics. Thử nghiệm này so sánh bật/tắt từng định dạng; muốn so sánh zone/network hay creative khác nhau thì cần bổ sung cấu hình biến thể tương ứng. Nếu Remote Config không tải được, ứng dụng dùng cấu hình mặc định hiện tại. Firebase web API key/config nằm ở client bundle; hãy giới hạn domain trong Firebase và không dùng config này làm cơ chế phân quyền.

Riêng Adsterra Pop-under có parameter thử nghiệm biến thể `ads_adsterra_popunder_variant` kiểu String: `existing` dùng tag đang hoạt động (control), `provided` dùng tag Pop-under mới (variant). Tạo Firebase A/B test cho parameter String này và đặt phân bổ control/variant theo tỷ lệ mong muốn; `ads_adsterra_popunder_enabled` vẫn là công tắc bật/tắt tổng. Consent quảng cáo và giới hạn tải tag một lần/24 giờ trên trình duyệt vẫn được áp dụng cho cả hai biến thể.

## Quyền riêng tư và tài liệu pháp lý

Privacy Policy, Terms of Use và Cookie Policy có route riêng cho cả bảy locale (`/{locale}/privacy`, `/{locale}/terms`, `/{locale}/cookies`), metadata/hreflang và sitemap. Route cũ `/privacy`, `/terms`, `/cookies` chuyển sang tiếng Việt. Trước khi production, bắt buộc thay tên pháp nhân, email có người xử lý yêu cầu và địa chỉ đăng ký bằng các biến `NEXT_PUBLIC_LEGAL_*`; văn bản mẫu cần luật sư tại khu vực hoạt động rà soát.

## Luồng xử lý

Bộ đọc trang phim hỗ trợ chuỗi JSON đã escape trong `self.__next_f.push(...)`
và record React Flight, không thực thi JavaScript. Các record tập phim có
`slug`/`link` được lọc theo tập đang mở. Nguồn HLS có ticket tải playlist gốc
`.m3u8`: kiểm tra URL/redirect, giới hạn 2 MiB, timeout 15 giây và xác minh
`#EXTM3U` trước khi trả attachment. Đây là file manifest nguyên bản, không phải
file phim: các URI tương đối vẫn phụ thuộc URL nguồn. Có luồng chuyển HLS VOD sang MP4 riêng, xem phần Chuyển HLS thành MP4 bên dưới.

Tính năng **Tải phim** có trang riêng `/{locale}/movie-downloader`, điều hướng
Header trên desktop/mobile và nội dung cho bảy ngôn ngữ. Không dùng ô nhập,
API phân tích hay job tải video mạng xã hội.

- `POST /api/movies/analyze` dùng Cheerio để phân tích DOM (video/source, metadata, data attributes), JSON-LD và cấu hình player tĩnh; duyệt player nhúng theo hàng đợi, bỏ URL trùng.
  Trả về danh sách nguồn MP4/HLS/DASH và trạng thái xác minh, không dừng ngay sau MP4 đầu tiên.
  Xác minh MIME và dung lượng MP4 trước khi cấp ticket; HLS có tải playlist gốc và chuyển MP4 cho các nguồn VOD được hỗ trợ; DASH hiện chỉ hiển thị URL.
- `GET /api/movies/download/:id` dùng ticket ngẫu nhiên có hạn 10 phút để
  stream nguồn MP4 đã xác minh. Chia sẻ tầng truyền dữ liệu có giới hạn dung
  lượng/concurrency với video, nhưng có kho ticket riêng (tối đa 500).
- Kho ticket nằm trong bộ nhớ: restart làm hết hạn; chạy nhiều instance cần
  sticky routing hoặc chuyển kho này sang Redis trước khi scale.
- Mỗi trang tối đa 2 MiB; tối đa 8 trang/player, sâu 2 cấp, 100 nguồn.
  Dò trang tối đa 25 giây, mỗi player 6 giây (API tổng 30 giây).
  Kết quả có cờ `incomplete`, số trang đã đọc và số player không truy cập được; không cam kết quét toàn bộ website.
  Mỗi redirect và nguồn tải đều được kiểm tra URL công khai.
- Không chạy JavaScript từ website, không gửi cookie, không hỗ trợ đăng nhập,
  DRM. Chuyển HLS VOD sang MP4 dùng luồng riêng mô tả bên dưới. Có thông báo riêng khi chỉ tìm thấy HLS.
- Trang Motchilliz được cung cấp dùng nguồn chính `.m3u8` và player nhúng;
  file `1s_blank.mp4` là nguồn mẫu của player, được loại khỏi kết quả.

Luồng video mạng xã hội hiện có:

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
| `ADS_ENABLED` | `true` | Bật/tắt quảng cáo; đặt `false` trước khi build để tắt toàn bộ ads |
| `NEXT_PUBLIC_LEGAL_OPERATOR_NAME` | `VideoDownloader` | Tên pháp nhân/cá nhân vận hành và kiểm soát dữ liệu |
| `NEXT_PUBLIC_LEGAL_CONTACT_EMAIL` | `privacy@findtoolpdf.online` | Email tiếp nhận yêu cầu quyền riêng tư |
| `NEXT_PUBLIC_LEGAL_POSTAL_ADDRESS` | `Vietnam` | Địa chỉ đăng ký đầy đủ của đơn vị vận hành |
| `NEXT_PUBLIC_MONETAG_VIGNETTE_ZONE_ID` | `12238810` | Monetag Vignette khi mở download dialog |
| `NEXT_PUBLIC_MONETAG_IN_PAGE_PUSH_ZONE_ID` | `12238840` | Monetag In-Page Push toàn site |
| `NEXT_PUBLIC_ADCASH_INTERSTITIAL_ZONE_ID` | `12435318` | Adcash Interstitial cho Analyze/Download |
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

### Chuyển HLS thành MP4

Trang Tải phim nhận cả trang xem phim và URL `.m3u8` trực tiếp. Bấm **Chuyển
thành MP4**, chờ tải các đoạn/ghép xong rồi bấm **Tải MP4 đã ghép**. Có nút
hủy trong lúc xử lý. Không tải cả phim vào RAM của trình duyệt.

- `POST /api/movies/convert` nhận ticket nguồn HLS đã phân tích, chọn variant
  có bandwidth cao nhất, tải segment và init fragment vào thư mục riêng dưới
  `TEMP_DIRECTORY`, rồi FFmpeg remux bằng `-c copy -movflags +faststart`.
- Chỉ hỗ trợ HLS VOD không mã hóa, TS hoặc fMP4, audio nằm trong cùng luồng.
  Chưa hỗ trợ livestream, DRM/AES, byte-range, audio playlist tách riêng hoặc
  codec không tương thích container MP4. Không tự hạ chất lượng hay bỏ lỗi segment.
- Kiểm tra URL công khai ở mỗi redirect/segment. FFmpeg chỉ được đọc protocol
  `file`, không tự truy cập mạng. Giới hạn mỗi segment 64 MiB, tổng dữ liệu tải
  và MP4 theo `MAX_FILE_SIZE`, tối đa 10.000 segment.
- `DOWNLOAD_TIMEOUT` giới hạn toàn bộ chuyển đổi (mặc định 10 phút),
  `MAX_CONCURRENT_JOBS` giới hạn số chuyển đổi; tối đa 5 tác vụ/file chờ tải.
  Cần dự phòng khoảng 2 × `MAX_FILE_SIZE` dung lượng đĩa cho mỗi tác vụ.
- File hoàn tất có link ngẫu nhiên dùng một lần trong 10 phút; được dọn sau
  tải, hết hạn, lỗi hoặc hủy. Tiến trình bị kill/restart có thể để lại thư mục
  `hls-*`; cần dọn chúng khi server dừng. Ticket/file không chia sẻ giữa instance.
- Request chuẩn bị giữ kết nối tới khi hoàn tất: cấu hình reverse proxy timeout
  phù hợp `DOWNLOAD_TIMEOUT`; không phù hợp host serverless có timeout ngắn.
- Docker đã cài FFmpeg. Local macOS: `brew install ffmpeg`, hoặc cấu hình
  `FFMPEG_PATH` tới binary. Không cần yt-dlp cho luồng chuyển đổi này.
