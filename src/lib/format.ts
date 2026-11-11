export function formatDuration(value?: number) {
  if (!value) return "—";
  const hours = Math.floor(value / 3600); const minutes = Math.floor((value % 3600) / 60); const seconds = Math.floor(value % 60);
  return [hours, minutes, seconds].filter((_, index) => index > 0 || hours > 0).map((part) => String(part).padStart(2, "0")).join(":");
}
export function formatBytes(value?: number, unknown = "Không rõ") {
  if (!value) return unknown;
  const units = ["B", "KB", "MB", "GB"]; let amount = value; let index = 0;
  while (amount >= 1024 && index < units.length - 1) { amount /= 1024; index += 1; }
  return `${amount >= 10 || index === 0 ? amount.toFixed(0) : amount.toFixed(1)} ${units[index]}`;
}
