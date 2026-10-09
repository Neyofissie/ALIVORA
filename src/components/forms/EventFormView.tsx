"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Switch } from "@/components/ui/Controls";
import { Field, Input, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { eventFormSchema, type EventForm } from "@/lib/domain/types";
import { CATEGORY_STYLES } from "@/components/cards/EventCard";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

export function EventFormView({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: EventForm;
  submitLabel: string;
  onSubmit: (values: EventForm) => void;
}) {
  const { state } = useStore();
  const [form, setForm] = useState<EventForm>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof EventForm>(k: K, v: EventForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = eventFormSchema.safeParse(form);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    onSubmit(result.data);
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {Object.keys(errors).length > 0 && <Alert tone="error" title="Please check the highlighted fields" />}
      <Field label="Title" error={errors.title}>
        {(p) => <Input {...p} value={form.title} maxLength={150} onChange={(e) => set("title", e.target.value)} placeholder="Swimming lessons" />}
      </Field>
      <Field label="Date" error={errors.date}>
        {(p) => <Input {...p} type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />}
      </Field>
      <div className="flex items-center justify-between">
        <span className="text-body">All day</span>
        <Switch label="All day" checked={form.allDay} onChange={(v) => set("allDay", v)} />
      </div>
      {!form.allDay && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Starts" error={errors.startTime}>
            {(p) => <Input {...p} type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />}
          </Field>
          <Field label="Ends" error={errors.endTime}>
            {(p) => <Input {...p} type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />}
          </Field>
        </div>
      )}
      <Field label="Location">
        {(p) => <Input {...p} value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="Optional" />}
      </Field>
      <Field label="Category">
        {(p) => (
          <Select {...p} value={form.category} onChange={(e) => set("category", e.target.value as EventForm["category"])}>
            {Object.entries(CATEGORY_STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
        )}
      </Field>
      <fieldset>
        <legend className="mb-2 text-caption font-medium text-text-secondary">Who&apos;s involved</legend>
        <div className="flex flex-wrap gap-2">
          {state.members.filter((m) => m.status === "active").map((m) => {
            const on = form.participantIds.includes(m.id);
            return (
              <button
                type="button"
                key={m.id}
                aria-pressed={on}
                onClick={() => set("participantIds", on ? form.participantIds.filter((x) => x !== m.id) : [...form.participantIds, m.id])}
                className={cn("flex min-h-11 items-center gap-2 rounded-full border py-1 pr-4 pl-1", on ? "border-primary bg-primary-soft" : "border-border bg-surface")}
              >
                <Avatar member={m} size="sm" /> <span className="text-body">{m.name}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Repeat">
          {(p) => (
            <Select {...p} value={form.repeat} onChange={(e) => set("repeat", e.target.value as EventForm["repeat"])}>
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>
          )}
        </Field>
        <Field label="Reminder">
          {(p) => (
            <Select {...p} value={form.reminderMinutes ?? ""} onChange={(e) => set("reminderMinutes", e.target.value === "" ? undefined : Number(e.target.value))}>
              <option value="">None</option>
              <option value="15">15 min before</option>
              <option value="30">30 min before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </Select>
          )}
        </Field>
      </div>
      <Button type="submit" block loading={saving} className="mt-2">{submitLabel}</Button>
    </form>
  );
}
