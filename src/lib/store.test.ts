import { describe, expect, it } from "vitest";
import { initialState, reducer } from "./store";

describe("household store", () => {
  it("schedules the next occurrence when a recurring task is completed", () => {
    const s = initialState("2026-10-09");
    const after = reducer(s, { type: "setTaskStatus", id: "t-bins", status: "completed" });
    const bins = after.tasks.filter((t) => t.title === "Take out the bins");
    expect(bins).toHaveLength(2);
    expect(bins.find((t) => t.status === "pending")?.dueDate).toBe("2026-10-19");
    // Completing again does not duplicate the next occurrence.
    const again = reducer(reducer(after, { type: "setTaskStatus", id: "t-bins", status: "pending" }), { type: "setTaskStatus", id: "t-bins", status: "completed" });
    expect(again.tasks.filter((t) => t.title === "Take out the bins")).toHaveLength(2);
  });

  it("unassigns tasks when a member is removed", () => {
    const s = reducer(initialState("2026-10-09"), { type: "removeMember", id: "m-james" });
    expect(s.members.some((m) => m.id === "m-james")).toBe(false);
    expect(s.tasks.some((t) => t.assigneeId === "m-james")).toBe(false);
  });
});
