import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function parseClockToMinutes(clock: string): number {
  const [hours, minutes] = clock.split(":").map((value) => Number.parseInt(value, 10));
  return hours * 60 + minutes;
}

export function formatUtcForTimezone(date: Date, timezone: string, pattern = "EEE, MMM d HH:mm zzz"): string {
  return formatInTimeZone(date, timezone, pattern);
}

export function weekdayInTimezone(date: Date, timezone: string): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
  }).format(date);
  return WEEKDAY_MAP[weekday] ?? 0;
}

export function minutesInTimezone(date: Date, timezone: string): number {
  const hhmm = formatInTimeZone(date, timezone, "HH:mm");
  return parseClockToMinutes(hhmm);
}

export function isRangeInsideWindow(startMinute: number, endMinute: number, windowStart: number, windowEnd: number): boolean {
  if (windowStart <= windowEnd) {
    return startMinute >= windowStart && endMinute <= windowEnd;
  }

  const inLateWindow = startMinute >= windowStart && endMinute <= 24 * 60;
  const inEarlyWindow = startMinute >= 0 && endMinute <= windowEnd;
  return inLateWindow || inEarlyWindow;
}

export function getLocalSlot(dateUtc: Date, durationMinutes: number, timezone: string): {
  startLabel: string;
  endLabel: string;
  startMinute: number;
  endMinute: number;
  weekday: number;
} {
  const endUtc = addMinutes(dateUtc, durationMinutes);

  return {
    startLabel: formatInTimeZone(dateUtc, timezone, "EEE HH:mm"),
    endLabel: formatInTimeZone(endUtc, timezone, "EEE HH:mm"),
    startMinute: minutesInTimezone(dateUtc, timezone),
    endMinute: minutesInTimezone(endUtc, timezone),
    weekday: weekdayInTimezone(dateUtc, timezone),
  };
}
