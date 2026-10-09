"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Archive, CalendarClock, Flag, ListX, Repeat, User } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Avatar } from "@/components/ui/Avatar";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ScreenSkeleton } from "@/components/ui/Feedback";
import { ConfirmDialog } from "@/components/ui/Sheet";
import { relativeDayLabel } from "@/lib/dates";
import { useStore } from "@/lib/store";

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, state, today, memberById, dispatch, toast } = useStore();
  const [confirm, setConfirm] = useState(false);
  const task = state.tasks.find((t) => t.id === id);
  const assignee = memberById(task?.assigneeId);
  const creator = memberById(task?.createdBy);

  return (
    <Screen>
      <SubHeader title="Task" />
      {!ready ? (
        <ScreenSkeleton />
      ) : !task ? (
        <EmptyState icon={ListX} title="Task not found" body="It may have been deleted." />
      ) : (
        <div className="flex flex-col gap-5">
          <section className="rounded-card bg-surface p-5 shadow-soft">
            <p className={`text-caption font-medium ${task.status === "completed" ? "text-success" : "text-text-secondary"}`}>
              {task.status === "completed" ? "Completed" : task.status === "archived" ? "Archived" : "To do"}
            </p>
            <h1 className="mt-1 text-h2 font-semibold">{task.title}</h1>
            {task.description && <p className="mt-2 text-body text-text-secondary">{task.description}</p>}
            <ul className="mt-4 flex flex-col gap-3 text-body text-text-secondary">
              <li className="flex items-center gap-3">
                <User className="size-5" strokeWidth={1.75} aria-hidden />
                {assignee ? <span className="flex items-center gap-2">{assignee.name} <Avatar member={assignee} size="xs" /></span> : "Unassigned"}
              </li>
              <li className="flex items-center gap-3">
                <CalendarClock className="size-5" strokeWidth={1.75} aria-hidden />
                {task.dueDate ? `${relativeDayLabel(task.dueDate, today)}${task.dueTime ? ` · ${task.dueTime}` : ""}` : "No due date"}
              </li>
              <li className="flex items-center gap-3">
                <Flag className="size-5" strokeWidth={1.75} aria-hidden />
                <span className={task.priority === "high" ? "font-medium text-error" : ""}>{task.priority[0]!.toUpperCase() + task.priority.slice(1)} priority</span>
              </li>
              {task.repeat !== "none" && (
                <li className="flex items-center gap-3"><Repeat className="size-5" strokeWidth={1.75} aria-hidden /> Repeats {task.repeat}</li>
              )}
            </ul>
            {creator && <p className="mt-4 text-caption text-text-secondary">Created by {creator.name}</p>}
          </section>

          {task.status === "pending" ? (
            <Button block onClick={() => { dispatch({ type: "setTaskStatus", id: task.id, status: "completed" }); toast({ tone: "success", title: "Task completed", body: "Great job!" }); }}>
              Mark as done
            </Button>
          ) : (
            <Button variant="secondary" block onClick={() => dispatch({ type: "setTaskStatus", id: task.id, status: "pending" })}>
              Reopen task
            </Button>
          )}
          <div className="grid grid-cols-3 gap-2">
            <LinkButton href={`/tasks/${task.id}/edit`} variant="tertiary" size="sm">Edit</LinkButton>
            <Button variant="tertiary" size="sm" disabled={task.status !== "pending"} onClick={() => { dispatch({ type: "setTaskStatus", id: task.id, status: "archived" }); toast({ tone: "info", title: "Task archived" }); router.push("/tasks"); }}>
              <Archive className="size-4" /> Archive
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setConfirm(true)}>Delete</Button>
          </div>
          <ConfirmDialog
            open={confirm}
            onOpenChange={setConfirm}
            title="Delete this task?"
            body="It will be removed for everyone in your household."
            confirmLabel="Delete task"
            onConfirm={() => { dispatch({ type: "deleteTask", id: task.id }); toast({ tone: "success", title: "Task deleted" }); router.push("/tasks"); }}
          />
        </div>
      )}
    </Screen>
  );
}
