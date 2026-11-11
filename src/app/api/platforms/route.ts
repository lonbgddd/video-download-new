import { ok } from "@/lib/api-response";
import { platforms } from "@/config/platforms";

export async function GET() { return ok({ platforms }); }
