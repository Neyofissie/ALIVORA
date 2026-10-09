import { describe, expect, it } from "vitest";
import { eventFormSchema } from "./types";
import { parseProposal } from "./ai";

const form = {
  title: "Swim",
  date: "2026-10-10",
  startTime: "17:00",
  endTime: "18:00",
  allDay: false,
  category: "activity" as const,
  participantIds: [],
  repeat: "none" as const,
};

describe("event form validation", () => {
  it("rejects an end time before the start time", () => {
    const r = eventFormSchema.safeParse({ ...form, endTime: "16:00" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.path).toEqual(["endTime"]);
  });

  it("accepts a valid event and all-day events regardless of times", () => {
    expect(eventFormSchema.safeParse(form).success).toBe(true);
    expect(eventFormSchema.safeParse({ ...form, allDay: true, endTime: "00:00" }).success).toBe(true);
  });

  it("enforces the 150 character title limit", () => {
    expect(eventFormSchema.safeParse({ ...form, title: "x".repeat(151) }).success).toBe(false);
  });
});

describe("AI proposal schema", () => {
  const valid = {
    intent: "create_task",
    requires_confirmation: true,
    actions: [
      { type: "create_task", title: "Pack swimming bag", assignee_id: null, due_local_date: "2026-10-10", due_local_time: "19:00", timezone: "Europe/London" },
    ],
    warnings: [],
  };

  it("accepts the PRD example proposal", () => {
    expect(parseProposal(valid).ok).toBe(true);
  });

  it("rejects invalid model output", () => {
    expect(parseProposal({ intent: "delete_everything", actions: [] }).ok).toBe(false);
    expect(parseProposal({ ...valid, actions: [{ type: "create_task", title: "" }] }).ok).toBe(false);
    expect(parseProposal("not json").ok).toBe(false);
  });

  it("rejects mutating proposals that skip confirmation", () => {
    expect(parseProposal({ ...valid, requires_confirmation: false }).ok).toBe(false);
  });
});
