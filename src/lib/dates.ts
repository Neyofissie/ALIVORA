import { addDays, addMonths, differenceInCalendarDays, format, parseISO } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const DEFAULT_TIMEZONE = "Europe/London";

/** The household-local calendar date (YYYY-MM-DD) for an instant. */
export function localDate(instant: Date, timezone: string): string {
  return formatInTimeZone(instant, timezone, "yyyy-MM-dd");
}

/** The household-local wall-clock time (HH:mm) for an instant. */
export function localTime(instant: Date, timezone: string): string {
  return formatInTimeZone(instant, timezone, "HH:mm");
}

/**
 * The next household-local calendar date after `instant`. Calculated on the
 * local calendar (not by adding 24h), so it stays correct across DST changes.
 */
export function nextLocalDate(instant: Date, timezone: string): string {
  return shiftDate(localDate(instant, timezone), 1);
}

/** Adds whole calendar days to a local date string. */
export function shiftDate(date: string, days: number): string {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}

export function shiftMonths(date: string, months: number): string {
  return format(addMonths(parseISO(date), months), "yyyy-MM-dd");
}

export function daysBetween(from: string, to: string): number {
  return differenceInCalendarDays(parseISO(to), parseISO(from));
}

/** Converts a household-local date and time to the UTC instant. */
export function zonedInstant(date: string, time: string, timezone: string): Date {
  return fromZonedTime(`${date}T${time}:00`, timezone);
}

/** 08:30 → "08:30"; kept 24h to match the design board. */
export function formatTime(time: string): string {
  return time;
}

export function formatDayLong(date: string): string {
  return format(parseISO(date), "EEEE d MMMM");
}

export function formatDayShort(date: string): string {
  return format(parseISO(date), "EEE d MMM");
}

export function weekdayName(date: string): string {
  return format(parseISO(date), "EEEE");
}

export function relativeDayLabel(date: string, today: string): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return formatDayShort(date);
}

export function greetingFor(time: string): string {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
