import { NextResponse } from "next/server";
import { AppError, publicErrorMessages } from "@/lib/errors";

export function ok<T>(data: T, status = 200) { return NextResponse.json({ success: true, data }, { status }); }

export function fail(error: unknown, requestId?: string) {
  if (error instanceof AppError) {
    return NextResponse.json({ success: false, error: { code: error.code, message: publicErrorMessages[error.code] }, requestId }, { status: error.status });
  }
  console.error(JSON.stringify({ level: "error", requestId, message: error instanceof Error ? error.message : "Unknown error" }));
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: publicErrorMessages.INTERNAL_ERROR }, requestId }, { status: 500 });
}
