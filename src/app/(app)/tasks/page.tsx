"use client";

import Link from "next/link";
import { useState } from "react";
import { ListChecks, Plus } from "lucide-react";
import { TabHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { TaskCard } from "@/components/cards/TaskCard";
import { LinkButton } from "@/components/ui/Button";
import { SegmentedTabs } from "@/components/ui/Controls";
import { EmptyState, ScreenSkeleton } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Field";
import type { Task } from "@/lib/domain/types";
import { useStore } from "@/lib/store";

export default function TasksPage() {
  const { ready, state, today, tomorrow, currentUser, memberById, dispatch, toast } = useStore();
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [member, setMember] = useState("");

  const visible = state.tasks.filter((t) => {
    if (t.status === "archived") return false;
    if (scope === "mine") return t.assigneeId === currentUser.id;
    if (member === "unassigned") return t.assigneeId === null;
    return !member || t.assigneeId === member;
  });
  const pending = visible.filter((t) => t.status === "pending");
  const groups: Array<[string, Task[]]> = [
    ["Overdue", pending.filter((t) => t.dueDate !== null && t.dueDate < today)],
    ["Today", pending.filter((t) => t.dueDate === today)],
    ["Tomorrow", pending.filter((t) => t.dueDate === tomorrow)],
    ["Later", pending.filter((t) => t.dueDate === null || t.dueDate > tomorrow)],
    ["Completed", visible.filter((t) => t.status === "completed")],
  ];

  const toggle = (t: Task, completed: boolean) => {
    dispatch({ type: "setTaskStatus", id: t.id, status: completed ? "completed" : "pending" });
    if (completed) toast({ tone: "success", title: "Task completed", body: t.repeat !== "none" ? "The next one is scheduled." : "Great job!" });
  };

  return (
    <Screen>
      <TabHeader
        title={<h1 className="text-h2 font-semibold">Tasks</h1>}
        action={
          <Link href="/tasks/new" aria-label="Add task" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-primary-soft">
            <Plus className="size-6" strokeWidth={1.75} />
          </Link>
        }
      />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <SegmentedTabs label="Task scope" value={scope} onChange={setScope} options={[{ value: "mine", label: "My tasks" }, { value: "all", label: "All tasks" }]} />
          {scope === "all" && (
            <Select aria-label="Filter by member" value={member} onChange={(e) => setMember(e.target.value)}>
              <option value="">Everyone</option>
              {state.members.filter((m) => m.kind === "adult").map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              <option value="unassigned">Unassigned</option>
            </Select>
          )}
          {visible.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No tasks yet"
              body="Share the load — create a task and assign it to someone."
              action={<LinkButton href="/tasks/new" size="sm" variant="secondary"><Plus className="size-4" /> Add task</LinkButton>}
            />
          ) : (
            groups.map(([label, tasks]) =>
              tasks.length === 0 ? null : (
                <section key={label}>
                  <h2 className={`mb-2 text-body font-semibold ${label === "Overdue" ? "text-error" : "text-text-secondary"}`}>
                    {label} <span className="font-normal">({tasks.length})</span>
                  </h2>
                  <div className="flex flex-col gap-2">
                    {tasks.map((t) => (
                      <TaskCard key={t.id} task={t} today={today} assignee={memberById(t.assigneeId)} onToggle={(c) => toggle(t, c)} />
                    ))}
                  </div>
                </section>
              ),
            )
          )}
        </div>
      )}
    </Screen>
  );
}
