import type { ErrorCode } from "@/types/api";

export class AppError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly status = 400) {
    super(message);
    this.name = "AppError";
  }
}

export const publicErrorMessages: Record<ErrorCode, string> = {
  INVALID_URL: "Liên kết không hợp lệ.",
  UNSUPPORTED_PLATFORM: "Nguồn này hiện chưa được hỗ trợ.",
  MEDIA_NOT_FOUND: "Không tìm thấy nội dung video.",
  PRIVATE_MEDIA: "Video có thể ở chế độ riêng tư.",
  RESTRICTED_MEDIA: "Nội dung này đang bị hạn chế.",
  FORMAT_NOT_AVAILABLE: "Định dạng bạn chọn hiện không khả dụng.",
  FILE_TOO_LARGE: "File vượt quá giới hạn cho phép.",
  MEDIA_TOO_LONG: "Video dài hơn giới hạn cho phép.",
  RATE_LIMIT: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
  PROCESSING_FAILED: "Không thể xử lý nội dung này.",
  TIMEOUT: "Quá trình xử lý đã hết thời gian.",
  INTERNAL_ERROR: "Đã có lỗi xảy ra. Vui lòng thử lại.",
};
