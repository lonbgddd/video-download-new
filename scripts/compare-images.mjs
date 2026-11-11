import sharp from "sharp";

const source = await sharp("/Users/longnguyen/Downloads/VideoDownloader_ Tải Video Nhanh Chóng (1).png").resize(1536, 1024, { fit: "fill" }).png().toBuffer();
const implementation = await sharp("implementation-desktop-final.png").resize(1536, 1024, { fit: "fill" }).png().toBuffer();
await sharp({ create: { width: 3072, height: 1024, channels: 3, background: "#ffffff" } })
  .composite([{ input: source, left: 0, top: 0 }, { input: implementation, left: 1536, top: 0 }])
  .png()
  .toFile("design-comparison.png");

const sourceFocus = await sharp(source).extract({ left: 0, top: 0, width: 1536, height: 620 }).png().toBuffer();
const implementationFocus = await sharp(implementation).extract({ left: 0, top: 0, width: 1536, height: 620 }).png().toBuffer();
await sharp({ create: { width: 3072, height: 620, channels: 3, background: "#ffffff" } })
  .composite([{ input: sourceFocus, left: 0, top: 0 }, { input: implementationFocus, left: 1536, top: 0 }])
  .png()
  .toFile("design-comparison-focus.png");
