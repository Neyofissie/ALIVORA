"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/Controls";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { taskFormSchema, type TaskForm } from "@/lib/domain/types";
import { useStore } from "@/lib/store";

export function TaskFormView({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: TaskForm;
  submitLabel: string;
  onSubmit: (values: TaskForm) => void;
}) {
  const { state } = useStore();
  const [form, setForm] = useState<TaskForm>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof TaskForm>(k: K, v: TaskForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  // Tasks can only be assigned to adults (dependants cannot sign in in V1.0).
  const adults = state.members.filter((m) => m.kind === "adult");

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const result = taskFormSchema.safeParse({ ...form, dueTime: form.dueTime || undefined });
        if (!result.success) {
          setErrors(Object.fromEntries(result.error.issues.map((i) => [String(i.path[0]), i.message])));
          return;
        }
        onSubmit(result.data);
      }}
    >
      <Field label="Title" error={errors.title}>
        {(p) => <Input {...p} value={form.title} maxLength={150} onChange={(e) => set("title", e.target.value)} placeholder="Pack school bags" />}
      </Field>
      <Field label="Notes">
        {(p) => <Textarea {...p} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="Optional" />}
      </Field>
      <Field label="Assign to">
        {(p) => (
          <Select {...p} value={form.assigneeId ?? ""} onChange={(e) => set("assigneeId", e.target.value || null)}>
            <option value="">Unassigned</option>
            {adults.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}{m.status === "invited" ? " (invited)" : ""}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Due date" error={errors.dueDate}>
          {(p) => <Input {...p} type="date" value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value || null)} />}
        </Field>
        <Field label="Due time" error={errors.dueTime}>
          {(p) => <Input {...p} type="time" value={form.dueTime ?? ""} onChange={(e) => set("dueTime", e.target.value || undefined)} />}
        </Field>
      </div>
      <Field label="Repeat">
        {(p) => (
          <Select {...p} value={form.repeat} onChange={(e) => set("repeat", e.target.value as TaskForm["repeat"])}>
            <option value="none">Does not repeat</option>
            <option value="daily">Every day</option>
            <option value="weekly">Every week</option>
          </Select>
        )}
      </Field>
      <fieldset>
        <legend className="mb-1 text-caption font-medium text-text-secondary">Priority</legend>
        <RadioGroup
          name="priority"
          className="flex-row gap-5"
          value={form.priority}
          onChange={(v) => set("priority", v)}
          options={[
            { value: "low", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "high", label: "High" },
          ]}
        />
      </fieldset>
      <Button type="submit" block className="mt-2">{submitLabel}</Button>
    </form>
  );
}
