"use client";

import { useState } from "react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Controls";
import { Field, Input, Select } from "@/components/ui/Field";
import { ScreenSkeleton } from "@/components/ui/Feedback";
import { CUISINES, TIMEZONES } from "@/lib/cuisines";
import { useStore } from "@/lib/store";
import type { Household } from "@/lib/domain/types";

function HouseholdForm({ household }: { household: Household }) {
  const { dispatch, toast } = useStore();
  const [form, setForm] = useState(household);
  const [error, setError] = useState<string>();
  return (
    <div className="flex flex-col gap-4">
      <Field label="Household name" error={error}>
        {(p) => <Input {...p} value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
      </Field>
      <Field label="Timezone">
        {(p) => (
          <Select {...p} value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
          </Select>
        )}
      </Field>
      <Field label="Tomorrow Ready time" hint="When the daily briefing is delivered, in household time.">
        {(p) => <Input {...p} type="time" value={form.briefingLocalTime} onChange={(e) => setForm({ ...form, briefingLocalTime: e.target.value })} />}
      </Field>
      <fieldset>
        <legend className="mb-2 text-caption font-medium text-text-secondary">Food traditions</legend>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((c) => (
            <Chip key={c.id} selected={form.cuisines.includes(c.id)} onClick={() => setForm({ ...form, cuisines: form.cuisines.includes(c.id) ? form.cuisines.filter((x) => x !== c.id) : [...form.cuisines, c.id] })}>
              {c.name}
            </Chip>
          ))}
        </div>
      </fieldset>
      <Button
        block
        onClick={() => {
          if (!form.name.trim()) return setError("Give your household a name");
          setError(undefined);
          dispatch({ type: "updateHousehold", patch: { ...form, name: form.name.trim() } });
          toast({ tone: "success", title: "Household updated" });
        }}
      >
        Save changes
      </Button>
    </div>
  );
}

export default function HouseholdSettingsPage() {
  const { ready, state } = useStore();
  return (
    <Screen>
      <SubHeader title="Household" />
      {ready ? <HouseholdForm household={state.household} /> : <ScreenSkeleton />}
    </Screen>
  );
}
