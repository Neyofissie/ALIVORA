import { describe, expect, it } from "vitest";
import { localDate, localTime, nextLocalDate, zonedInstant } from "./dates";

const LONDON = "Europe/London";

describe("household-local dates", () => {
  it("uses the household timezone, not UTC, near midnight", () => {
    // 23:30 UTC on 9 Oct is 00:30 on 10 Oct in London (BST).
    const instant = new Date("2026-10-09T23:30:00Z");
    expect(localDate(instant, LONDON)).toBe("2026-10-10");
    expect(nextLocalDate(instant, LONDON)).toBe("2026-10-11");
  });

  it("finds tomorrow correctly on the day clocks go back (25-hour day)", () => {
    // UK clocks go back at 02:00 BST on Sunday 25 Oct 2026.
    const evening = new Date("2026-10-24T18:00:00Z"); // 19:00 BST Saturday
    expect(nextLocalDate(evening, LONDON)).toBe("2026-10-25");
    const lateSunday = new Date("2026-10-25T23:30:00Z"); // 23:30 GMT Sunday
    expect(nextLocalDate(lateSunday, LONDON)).toBe("2026-10-26");
  });

  it("finds tomorrow correctly on the day clocks go forward (23-hour day)", () => {
    const lateSaturday = new Date("2026-03-28T23:30:00Z"); // 23:30 GMT Saturday
    expect(nextLocalDate(lateSaturday, LONDON)).toBe("2026-03-29");
  });

  it("keeps a 19:00 briefing at 19:00 local either side of the DST change", () => {
    const before = zonedInstant("2026-10-24", "19:00", LONDON);
    const after = zonedInstant("2026-10-26", "19:00", LONDON);
    expect(before.toISOString()).toBe("2026-10-24T18:00:00.000Z");
    expect(after.toISOString()).toBe("2026-10-26T19:00:00.000Z");
    expect(localTime(before, LONDON)).toBe("19:00");
    expect(localTime(after, LONDON)).toBe("19:00");
  });
});
