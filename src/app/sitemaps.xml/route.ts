import { NextResponse } from "next/server";
import { getSiteUrl } from "@/config/site-url";

export function GET() {
  return NextResponse.redirect(new URL("/sitemap.xml", getSiteUrl()), 308);
}
