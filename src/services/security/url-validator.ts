import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { AppError } from "@/lib/errors";

const blockedHostnames = new Set(["localhost", "metadata.google.internal", "metadata", "0.0.0.0"]);

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  const [a, b] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("::ffff:127.");
}

export function isPrivateIp(ip: string) {
  return isIP(ip) === 4 ? isPrivateIpv4(ip) : isIP(ip) === 6 ? isPrivateIpv6(ip) : true;
}

export async function validatePublicUrl(input: string): Promise<URL> {
  let url: URL;
  try { url = new URL(input.trim()); } catch { throw new AppError("INVALID_URL", "Invalid URL"); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new AppError("INVALID_URL", "Only public HTTP(S) URLs are allowed");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (blockedHostnames.has(hostname) || hostname.endsWith(".local") || hostname.endsWith(".internal")) throw new AppError("INVALID_URL", "Private host blocked");
  if (isIP(hostname) && isPrivateIp(hostname)) throw new AppError("INVALID_URL", "Private IP blocked");
  let addresses: Array<{ address: string }>;
  try { addresses = await lookup(hostname, { all: true, verbatim: true }); } catch { throw new AppError("INVALID_URL", "Hostname could not be resolved"); }
  if (!addresses.length || addresses.some(({ address }) => isPrivateIp(address))) throw new AppError("INVALID_URL", "Private network target blocked");
  url.hash = "";
  return url;
}
