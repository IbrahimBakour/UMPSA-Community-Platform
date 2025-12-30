import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(
  dateInput: string | number | Date,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
) {
  const date = new Date(dateInput);
  const fmt = new Intl.DateTimeFormat(
    locale || (typeof navigator !== "undefined" ? navigator.language : "en-US"),
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    }
  );
  return fmt.format(date);
}

export function toGoogleCalendarLink(
  title: string,
  start: Date,
  durationMinutes = 60,
  details?: string
) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const startUtc = new Date(start);
  const endUtc = new Date(startUtc.getTime() + durationMinutes * 60000);

  const buildStamp = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const mm = pad(d.getUTCMinutes());
    const ss = "00";
    return `${y}${m}${day}T${hh}${mm}${ss}Z`;
  };

  const startStr = buildStamp(startUtc);
  const endStr = buildStamp(endUtc);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", `${startStr}/${endStr}`);
  if (details) url.searchParams.set("details", details);
  return url.toString();
}
