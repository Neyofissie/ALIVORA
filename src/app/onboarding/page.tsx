"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Controls";
import { Field, Input, Select } from "@/components/ui/Field";
import { Logo } from "@/components/layout/Logo";
import { CUISINES, TIMEZONES } from "@/lib/cuisines";
import { useStore } from "@/lib/store";

const householdStep = z.object({
  name: z.string().trim().min(1, "Give your household a name").max(120),
  timezone: z.string().min(1),
  briefingLocalTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const STEPS = ["Household", "Food traditions", "Invite family"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { dispatch, toast } = useStore();
  const [step, setStep] = useState(0);
  const [household, setHousehold] = useState({ name: "", timezone: "Europe/London", briefingLocalTime: "19:00" });
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState<string>();

  function next() {
    if (step === 0) {
      const r = householdStep.safeParse(household);
      if (!r.success) return setError(r.error.issues[0]?.message);
    }
    setError(undefined);
    if (step < STEPS.length - 1) return setStep(step + 1);
    dispatch({ type: "completeOnboarding", household: { ...household, name: household.name.trim(), cuisines }, invites });
    toast({ tone: "success", title: "Household created", body: invites.length ? `${invites.length} invitation(s) sent.` : "You can invite family any time." });
    router.push("/home");
  }

  function addInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!z.string().email().safeParse(email).success) return setError("Enter a valid email address");
    if (invites.includes(email)) return setError("That email is already on the list");
    setError(undefined);
    setInvites([...invites, email]);
    setInviteEmail("");
  }

  const filtered = CUISINES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 pt-8 pb-8">
      <Logo className="text-[26px]" />
      <ol className="mt-6 flex gap-2" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <li key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}>
            <span className="sr-only">{s}{i === step ? " (current)" : ""}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="mt-8 flex flex-col gap-4">
          <div>
            <h1 className="font-display text-h1 font-medium">Create your household</h1>
            <p className="mt-1 text-body text-text-secondary">This is the shared space for your family&apos;s plans.</p>
          </div>
          <Field label="Household name" error={error}>
            {(p) => <Input {...p} autoFocus value={household.name} onChange={(e) => setHousehold({ ...household, name: e.target.value })} placeholder="The Williams Family" maxLength={120} />}
          </Field>
          <Field label="Timezone" hint="Tomorrow Ready and reminders use your household's local time.">
            {(p) => (
              <Select {...p} value={household.timezone} onChange={(e) => setHousehold({ ...household, timezone: e.target.value })}>
                {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace("_", " ")}</option>)}
              </Select>
            )}
          </Field>
          <Field label="Tomorrow Ready time">
            {(p) => <Input {...p} type="time" value={household.briefingLocalTime} onChange={(e) => setHousehold({ ...household, briefingLocalTime: e.target.value })} />}
          </Field>
        </section>
      )}

      {step === 1 && (
        <section className="mt-8 flex flex-col gap-4">
          <div>
            <h1 className="font-display text-h1 font-medium">Your food traditions</h1>
            <p className="mt-1 text-body text-text-secondary">Optional. Choose any cuisines your family enjoys — we&apos;ll use these when Alivora Meals arrives.</p>
          </div>
          <Input icon={<Search className="size-4" />} aria-label="Search cuisines" placeholder="Search cuisines" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            {filtered.map((c) => (
              <Chip key={c.id} selected={cuisines.includes(c.id)} onClick={() => setCuisines((cs) => (cs.includes(c.id) ? cs.filter((x) => x !== c.id) : [...cs, c.id]))}>
                {c.name}
              </Chip>
            ))}
            {filtered.length === 0 && <p className="text-body text-text-secondary">No cuisines match “{query}”.</p>}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8 flex flex-col gap-4">
          <div>
            <h1 className="font-display text-h1 font-medium">Invite your family</h1>
            <p className="mt-1 text-body text-text-secondary">Invite another adult to share planning. Invitations expire after 7 days.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Field label="Email address" error={error}>
                {(p) => <Input {...p} type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInvite())} placeholder="partner@example.com" />}
              </Field>
            </div>
            <Button variant="secondary" className="mt-[26px] px-4" onClick={addInvite} aria-label="Add invitation">
              <Plus className="size-5" />
            </Button>
          </div>
          <ul className="flex flex-col gap-2">
            {invites.map((email) => (
              <li key={email} className="flex items-center justify-between rounded-input bg-surface px-4 py-2 shadow-soft">
                <span className="truncate text-body">{email}</span>
                <button aria-label={`Remove ${email}`} onClick={() => setInvites(invites.filter((i) => i !== email))} className="inline-flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-primary-soft">
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button block onClick={next}>
          {step === STEPS.length - 1 ? (invites.length ? "Send invites & open Alivora" : "Open Alivora") : "Continue"}
        </Button>
        {step > 0 && (
          <Button variant="ghost" block onClick={() => (setError(undefined), setStep(step - 1))}>
            Back
          </Button>
        )}
      </div>
    </main>
  );
}
