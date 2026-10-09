"use client";

import { useState } from "react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Switch } from "@/components/ui/Controls";
import { Field, Input } from "@/components/ui/Field";

const OPTIONS = [
  { key: "tomorrow", label: "Tomorrow Ready", body: "Your evening briefing for the next day" },
  { key: "assigned", label: "Task assigned to me", body: "When someone gives you a responsibility" },
  { key: "reminders", label: "Event reminders", body: "Before events you're part of" },
  { key: "email", label: "Email notifications", body: "Also send these by email" },
] as const;

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ tomorrow: true, assigned: true, reminders: true, email: false });
  const [quiet, setQuiet] = useState(true);
  return (
    <Screen>
      <SubHeader title="Notifications" />
      <ul className="divide-y divide-border rounded-card bg-surface shadow-soft">
        {OPTIONS.map((o) => (
          <li key={o.key} className="flex min-h-16 items-center gap-3 px-4 py-2">
            <div className="flex-1">
              <p className="text-body font-semibold">{o.label}</p>
              <p className="text-caption text-text-secondary">{o.body}</p>
            </div>
            <Switch label={o.label} checked={!!prefs[o.key]} onChange={(v) => setPrefs({ ...prefs, [o.key]: v })} />
          </li>
        ))}
      </ul>
      <section className="mt-4 rounded-card bg-surface p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-body font-semibold">Quiet hours</p>
            <p className="text-caption text-text-secondary">Pause optional notifications overnight</p>
          </div>
          <Switch label="Quiet hours" checked={quiet} onChange={setQuiet} />
        </div>
        {quiet && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="From">{(p) => <Input {...p} type="time" defaultValue="21:30" />}</Field>
            <Field label="Until">{(p) => <Input {...p} type="time" defaultValue="07:00" />}</Field>
          </div>
        )}
      </section>
      <p className="mt-4 px-1 text-caption text-text-secondary">Security and billing emails are always delivered.</p>
    </Screen>
  );
}
