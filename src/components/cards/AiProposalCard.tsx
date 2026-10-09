"use client";

import { useState } from "react";
import { CalendarPlus, ListPlus, Sparkles } from "lucide-react";
import type { ProposalAction } from "@/lib/domain/ai";
import type { Member } from "@/lib/domain/types";
import { dueLabel } from "@/lib/ai/interpret";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

/**
 * Editable confirmation for a proposed AI action. Copy is phrased as a
 * question and nothing is saved until Confirm — the card must never imply a
 * proposal has already been written.
 */
export function AiProposalCard({
  action,
  members,
  today,
  status,
  onConfirm,
  onReject,
}: {
  action: ProposalAction;
  members: Member[];
  today: string;
  status: "pending" | "confirmed" | "rejected";
  onConfirm: (edited: ProposalAction) => void;
  onReject: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProposalAction>(action);
  const adults = members.filter((m) => m.kind === "adult" && m.status === "active");
  const isTask = draft.type === "create_task";
  const assignee = isTask ? members.find((m) => m.id === draft.assignee_id) : undefined;
  const participants = !isTask ? members.filter((m) => draft.participant_ids.includes(m.id)) : [];

  if (status !== "pending") {
    return (
      <div className="rounded-card border border-border bg-surface p-4 text-body">
        <p className="font-semibold">{draft.title}</p>
        <p className={status === "confirmed" ? "text-success" : "text-text-secondary"}>
          {status === "confirmed" ? (isTask ? "Task saved" : "Event saved") : "Not created"}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up rounded-card border border-secondary/50 bg-secondary-soft p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
          {isTask ? <ListPlus className="size-[18px]" strokeWidth={1.75} /> : <CalendarPlus className="size-[18px]" strokeWidth={1.75} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-caption font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden /> Proposed — not saved yet
          </p>
          <p className="text-body-lg font-semibold">{isTask ? "Create this task?" : "Create this event?"}</p>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-3">
          <Field label="Title">
            {(p) => <Input {...p} value={draft.title} maxLength={150} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />}
          </Field>
          {draft.type === "create_task" ? (
            <>
              <Field label="Due date">
                {(p) => (
                  <Input
                    {...p}
                    type="date"
                    value={draft.due_local_date ?? ""}
                    onChange={(e) => setDraft({ ...draft, due_local_date: e.target.value || null })}
                  />
                )}
              </Field>
              <Field label="Assign to">
                {(p) => (
                  <Select {...p} value={draft.assignee_id ?? ""} onChange={(e) => setDraft({ ...draft, assignee_id: e.target.value || null })}>
                    <option value="">Unassigned</option>
                    {adults.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Field label="Date">
                  {(p) => <Input {...p} type="date" value={draft.local_date} onChange={(e) => setDraft({ ...draft, local_date: e.target.value })} />}
                </Field>
              </div>
              <Field label="Starts">
                {(p) => <Input {...p} type="time" value={draft.start_local_time} onChange={(e) => setDraft({ ...draft, start_local_time: e.target.value })} />}
              </Field>
              <Field label="Ends">
                {(p) => <Input {...p} type="time" value={draft.end_local_time} onChange={(e) => setDraft({ ...draft, end_local_time: e.target.value })} />}
              </Field>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 flex items-end justify-between gap-3 pl-12">
          <div className="min-w-0">
            <p className="truncate text-body font-semibold">{draft.title}</p>
            <p className="text-caption text-text-secondary">
              {draft.type === "create_task"
                ? [dueLabel(draft.due_local_date, today), draft.due_local_time, draft.repeat !== "none" ? `Repeats ${draft.repeat}` : null]
                    .filter(Boolean)
                    .join(" · ")
                : `${dueLabel(draft.local_date, today)} · ${draft.start_local_time} – ${draft.end_local_time}`}
              {assignee ? ` · ${assignee.name}` : isTask ? " · Unassigned" : ""}
            </p>
          </div>
          {assignee && <Avatar member={assignee} size="xs" />}
          {participants.length > 0 && <AvatarGroup members={participants} size="xs" />}
        </div>
      )}

      <div className="mt-4 grid grid-cols-[auto_1fr_1fr] gap-2">
        <Button variant="ghost" size="sm" onClick={onReject}>
          Dismiss
        </Button>
        <Button variant="tertiary" size="sm" onClick={() => setEditing((e) => !e)}>
          {editing ? "Done" : "Edit"}
        </Button>
        <Button size="sm" disabled={!draft.title.trim()} onClick={() => onConfirm(draft)}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
