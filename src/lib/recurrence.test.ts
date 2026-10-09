import { describe, expect, it } from "vitest";
import type { FamilyEvent } from "./domain/types";
import { occurrencesBetween } from "./recurrence";
import { zonedInstant } from "./dates";

const weekly: FamilyEvent = {
  id: "e1",
  title: "Football training",
  date: "2026-10-13",
  startTime: "17:00",
  endTime: "18:00",
  allDay: false,
  category: "activity",
  participantIds: [],
  recurrence: { frequency: "weekly" },
  exceptions: [],
  createdBy: "u",
};

describe("recurrence", () => {
  it("expands weekly events within a range", () => {
    const dates = occurrencesBetween([weekly], "2026-10-01", "2026-11-05").map((o) => o.occurrenceDate);
    expect(dates).toEqual(["2026-10-13", "2026-10-20", "2026-10-27", "2026-11-03"]);
  });

  it("keeps the intended local time across the October DST change", () => {
    const [before, after] = occurrencesBetween([weekly], "2026-10-20", "2026-10-27");
    expect(before!.startTime).toBe("17:00");
    expect(after!.startTime).toBe("17:00");
    // Same local time, different UTC offsets.
    expect(zonedInstant(before!.occurrenceDate, before!.startTime, "Europe/London").getUTCHours()).toBe(16);
    expect(zonedInstant(after!.occurrenceDate, after!.startTime, "Europe/London").getUTCHours()).toBe(17);
  });

  it("only removes the cancelled occurrence", () => {
    const dates = occurrencesBetween([{ ...weekly, exceptions: ["2026-10-20"] }], "2026-10-13", "2026-10-27").map(
      (o) => o.occurrenceDate,
    );
    expect(dates).toEqual(["2026-10-13", "2026-10-27"]);
  });

  it("honours count and until terminations", () => {
    expect(occurrencesBetween([{ ...weekly, recurrence: { frequency: "weekly", count: 2 } }], "2026-10-01", "2026-12-31")).toHaveLength(2);
    expect(
      occurrencesBetween([{ ...weekly, recurrence: { frequency: "daily", until: "2026-10-15" } }], "2026-10-01", "2026-12-31"),
    ).toHaveLength(3);
  });
});
