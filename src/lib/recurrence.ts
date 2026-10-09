import type { EventOccurrence, FamilyEvent } from "./domain/types";
import { daysBetween, shiftDate, shiftMonths } from "./dates";

const MAX_OCCURRENCES = 1000;

/**
 * Expands events into occurrences between two local dates (inclusive).
 * Occurrences are stepped on the local calendar, so a weekly 17:00 event
 * stays at 17:00 local time across daylight-saving changes.
 */
export function occurrencesBetween(
  events: FamilyEvent[],
  from: string,
  to: string,
): EventOccurrence[] {
  const result: EventOccurrence[] = [];
  for (const event of events) {
    if (!event.recurrence) {
      if (event.date >= from && event.date <= to) result.push({ ...event, occurrenceDate: event.date });
      continue;
    }
    const { frequency, until, count } = event.recurrence;
    for (let i = 0; i < (count ?? MAX_OCCURRENCES); i++) {
      const date =
        frequency === "daily"
          ? shiftDate(event.date, i)
          : frequency === "weekly"
            ? shiftDate(event.date, i * 7)
            : shiftMonths(event.date, i);
      if (date > to || (until && date > until)) break;
      if (date < from || event.exceptions.includes(date)) continue;
      result.push({ ...event, occurrenceDate: date });
    }
  }
  return result.sort(
    (a, b) =>
      a.occurrenceDate.localeCompare(b.occurrenceDate) ||
      Number(b.allDay) - Number(a.allDay) ||
      a.startTime.localeCompare(b.startTime),
  );
}

export function occurrencesOn(events: FamilyEvent[], date: string): EventOccurrence[] {
  return occurrencesBetween(events, date, date);
}

/** True when a recurring daily task's first due date has arrived. */
export function isRecurringStarted(firstDue: string, date: string): boolean {
  return daysBetween(firstDue, date) >= 0;
}
