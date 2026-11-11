export type ErrorCode =
  | "INVALID_URL" | "UNSUPPORTED_PLATFORM" | "MEDIA_NOT_FOUND" | "PRIVATE_MEDIA"
  | "RESTRICTED_MEDIA" | "FORMAT_NOT_AVAILABLE" | "FILE_TOO_LARGE" | "MEDIA_TOO_LONG"
  | "RATE_LIMIT" | "PROCESSING_FAILED" | "EXTRACTOR_UNAVAILABLE" | "TIMEOUT" | "INTERNAL_ERROR";

export class ApiRequestError extends Error {
  constructor(public readonly code: ErrorCode, message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: { code: ErrorCode; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
