"use client";

import Link from "next/link";
import { Repeat } from "lucide-react";
import type { Member, Task } from "@/lib/domain/types";
import { relativeDayLabel } from "@/lib/dates";
import { Avatar } from "@/components/ui/Avatar";
import { Checkbox } from "@/components/ui/Controls";
import { cn } from "@/lib/cn";

export function TaskCard({
  task,
  assignee,
  today,
  onToggle,
}: {
  task: Task;
  assignee?: Member;
  today: string;
  onToggle: (completed: boolean) => void;
}) {
  const done = task.status === "completed";
  const overdue = !done && task.dueDate !== null && task.dueDate < today;
  return (
    <div className="flex items-center gap-2 rounded-card bg-surface py-1.5 pr-4 pl-3 shadow-soft">
      <Checkbox checked={done} onChange={onToggle} label={`Complete “${task.title}”`} hideLabel />
      <Link href={`/tasks/${task.id}`} className="flex min-h-12 min-w-0 flex-1 flex-col justify-center py-1.5">
        <span className={cn("truncate text-body font-semibold", done ? "text-text-secondary line-through" : "text-text-primary")}>
          {task.title}
        </span>
        <span className="flex flex-wrap items-center gap-x-1.5 text-caption text-text-secondary">
          <span className={cn(overdue && "font-medium text-error")}>
            {task.dueDate ? (overdue ? `Overdue · ${relativeDayLabel(task.dueDate, today)}` : relativeDayLabel(task.dueDate, today)) : "No due date"}
            {task.dueTime && !overdue ? ` · ${task.dueTime}` : ""}
          </span>
          {task.priority === "high" && !done && (
            <>
              <span aria-hidden>·</span>
              <span className="font-medium text-error">High priority</span>
            </>
          )}
          {task.repeat !== "none" && <Repeat className="size-3" aria-label={`Repeats ${task.repeat}`} />}
        </span>
      </Link>
      {assignee ? (
        <Avatar member={assignee} size="sm" />
      ) : (
        <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">Unassigned</span>
      )}
    </div>
  );
}
