import { describe, expect, it } from "vitest";
import { buildBriefing } from "./briefing";
import type { FamilyEvent, Task } from "./domain/types";
import { seedMembers } from "./mock/seed";

const DATE = "2026-10-12";
const event = (id: string, title: string, startTime: string, date = DATE): FamilyEvent => ({
  id, title, date, startTime, endTime: "23:00", allDay: false, category: "family", participantIds: [], exceptions: [], createdBy: "m-emma",
});
const task = (id: string, assigneeId: string | null, extra: Partial<Task> = {}): Task => ({
  id, title: `Task ${id}`, assigneeId, dueDate: DATE, priority: "normal", status: "pending", repeat: "none", createdBy: "m-emma", ...extra,
});

describe("Tomorrow Ready (deterministic)", () => {
  it("includes all three events and two tasks for the date — no AI required", () => {
    const b = buildBriefing({
      date: DATE,
      members: seedMembers(),
      events: [event("a", "Swimming lessons", "17:00"), event("b", "School drop-off", "08:30"), event("c", "Work meeting", "10:00"), event("x", "Other day", "09:00", "2026-10-13")],
      tasks: [task("1", "m-james"), task("2", null), task("done", "m-emma", { status: "completed" }), task("later", "m-emma", { dueDate: "2026-10-14" })],
    });
    expect(b.events.map((e) => e.id)).toEqual(["b", "c", "a"]);
    expect(b.tasks.map((t) => t.id)).toEqual(["1", "2"]);
    expect(b.summary).toEqual({ events: 3, tasks: 2, unassigned: 1 });
    expect(b.generatedBy).toBe("deterministic");
    expect(b.heading).toBe("Tomorrow Ready — Monday");
  });

  it("suggests preparation from confirmed events without creating tasks", () => {
    const tasks: Task[] = [];
    const b = buildBriefing({ date: DATE, members: [], events: [event("a", "Swimming lessons", "17:00")], tasks });
    expect(b.preparation).toContain("Pack the swimming bag.");
    expect(tasks).toHaveLength(0);
  });

  it("returns an empty, valid briefing on a quiet day", () => {
    const b = buildBriefing({ date: DATE, members: [], events: [], tasks: [] });
    expect(b.summary).toEqual({ events: 0, tasks: 0, unassigned: 0 });
  });
});
