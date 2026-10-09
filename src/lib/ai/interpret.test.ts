import { describe, expect, it } from "vitest";
import { interpret } from "./interpret";
import { seedMembers } from "../mock/seed";

// Friday 9 October 2026
const ctx = { today: "2026-10-09", timezone: "Europe/London", currentUserId: "m-emma", members: seedMembers(), events: [] };

describe("local AI interpreter", () => {
  it("creates an event proposal with date, time and participants", () => {
    const p = interpret("Add swimming lessons for Ava on Saturday at 10", ctx)!;
    expect(p.intent).toBe("create_event");
    expect(p.requires_confirmation).toBe(true);
    expect(p.actions[0]).toMatchObject({ type: "create_event", title: "Swimming lessons", local_date: "2026-10-10", start_local_time: "10:00", end_local_time: "11:00", participant_ids: ["m-ava"] });
  });

  it("strips day phrases from titles", () => {
    expect(interpret("Add swimming lessons for Saturday at 10", ctx)!.actions[0]!.title).toBe("Swimming lessons");
  });

  it("assigns a recurring task to a named adult", () => {
    const p = interpret("Remind James to take out the bins every Thursday", ctx)!;
    expect(p.intent).toBe("create_recurring_task");
    expect(p.actions[0]).toMatchObject({ type: "create_task", title: "Take out the bins", assignee_id: "m-james", repeat: "weekly", due_local_date: "2026-10-15" });
  });

  it("splits multiple tasks", () => {
    const p = interpret("Prepare the school bags and pack lunch tomorrow", ctx)!;
    expect(p.intent).toBe("create_multiple_tasks");
    expect(p.actions.map((a) => a.title)).toEqual(["Prepare the school bags", "Pack lunch"]);
  });

  it("never assigns tasks to dependants or invents members", () => {
    expect(interpret("Ask Ava to tidy her room", ctx)!.actions[0]).toMatchObject({ assignee_id: null });
    const p = interpret("Ask Grandad to collect the children tomorrow", ctx)!;
    expect(p.actions[0]).toMatchObject({ assignee_id: null });
    expect(p.warnings[0]).toMatch(/couldn't find/);
  });

  it("asks for clarification instead of guessing", () => {
    const p = interpret("hmm", ctx)!;
    expect(p.intent).toBe("clarify");
    expect(p.actions).toHaveLength(0);
  });
});
