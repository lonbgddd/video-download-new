import sharp from "sharp";

await sharp("/Users/longnguyen/Downloads/VideoDownloader_ Tải Video Nhanh Chóng (1).png")
  .extract({ left: 94, top: 5, width: 42, height: 42 })
  .resize(64, 64)
  .png()
  .toFile("src/app/icon.png");
