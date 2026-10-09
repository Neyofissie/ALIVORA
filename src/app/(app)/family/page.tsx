"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Baby, ChevronRight, Settings, UserPlus } from "lucide-react";
import { TabHeader } from "@/components/layout/TopBar";
import { Screen, SectionHeader } from "@/components/layout/Screen";
import { HouseholdCard, SubscriptionCard } from "@/components/cards/HouseholdCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { ScreenSkeleton } from "@/components/ui/Feedback";
import { BottomSheet, ConfirmDialog } from "@/components/ui/Sheet";
import type { Member } from "@/lib/domain/types";
import { PLANS } from "@/lib/plans";
import { useStore } from "@/lib/store";

const ROLE_LABEL = { owner: "Owner", admin: "Admin", member: "Member" } as const;

export default function FamilyPage() {
  const { ready, state, currentUser, dispatch, toast } = useStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [dependantOpen, setDependantOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [depName, setDepName] = useState("");
  const [depNote, setDepNote] = useState("");
  const [error, setError] = useState<string>();
  const [removing, setRemoving] = useState<Member | null>(null);

  const plan = PLANS[state.household.plan];
  const adults = state.members.filter((m) => m.kind === "adult");
  const dependants = state.members.filter((m) => m.kind === "dependant");
  const canManage = currentUser.role === "owner" || currentUser.role === "admin";
  const atLimit = adults.length >= plan.adultLimit;

  function invite() {
    const value = email.trim().toLowerCase();
    if (!z.string().email().safeParse(value).success) return setError("Enter a valid email address");
    if (state.members.some((m) => m.email === value)) return setError("This person is already in your household");
    dispatch({ type: "inviteMember", email: value, role });
    toast({ tone: "success", title: "Invitation sent", body: `${value} has 7 days to accept.` });
    setEmail("");
    setError(undefined);
    setInviteOpen(false);
  }

  function MemberRow({ m }: { m: Member }) {
    return (
      <li className="flex min-h-16 items-center gap-3 px-4 py-2">
        <Avatar member={m} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body font-semibold">
            {m.name} {m.id === currentUser.id && <span className="font-normal text-text-secondary">(you)</span>}
          </p>
          <p className="text-caption text-text-secondary">
            {m.kind === "dependant" ? `Child${m.note ? ` · ${m.note}` : ""}` : m.status === "invited" ? `Invited · ${m.email}` : ROLE_LABEL[m.role ?? "member"]}
          </p>
        </div>
        {canManage && m.role !== "owner" && (
          <Button variant="ghost" size="sm" className="text-error" onClick={() => setRemoving(m)} aria-label={`Remove ${m.name}`}>
            Remove
          </Button>
        )}
      </li>
    );
  }

  return (
    <Screen>
      <TabHeader
        title={<h1 className="text-h2 font-semibold">Our Family</h1>}
        action={
          canManage ? (
            <button onClick={() => setInviteOpen(true)} aria-label="Invite family member" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-primary-soft">
              <UserPlus className="size-[22px]" strokeWidth={1.75} />
            </button>
          ) : null
        }
      />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <div className="flex flex-col gap-7">
          <section>
            <SectionHeader title="Adults" action={<span className="text-caption text-text-secondary">{adults.length} of {plan.adultLimit} on {plan.name}</span>} />
            <ul className="divide-y divide-border rounded-card bg-surface shadow-soft">
              {adults.map((m) => <MemberRow key={m.id} m={m} />)}
            </ul>
            {canManage && (
              <Button variant="tertiary" block className="mt-3" onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-4" /> Invite an adult
              </Button>
            )}
          </section>

          <section>
            <SectionHeader title="Children" />
            <ul className="divide-y divide-border rounded-card bg-surface shadow-soft">
              {dependants.map((m) => <MemberRow key={m.id} m={m} />)}
              {dependants.length === 0 && <li className="px-4 py-4 text-body text-text-secondary">No children added yet.</li>}
            </ul>
            {canManage && (
              <Button variant="tertiary" block className="mt-3" onClick={() => setDependantOpen(true)}>
                <Baby className="size-4" /> Add a child
              </Button>
            )}
          </section>

          <section>
            <SectionHeader title="Household" />
            <HouseholdCard name={state.household.name} taskCount={state.tasks.filter((t) => t.status === "pending").length} members={state.members} />
          </section>

          {state.household.plan === "free" && <SubscriptionCard planName={plan.name} />}

          <Link href="/settings" className="flex min-h-14 items-center gap-3 rounded-card bg-surface px-4 shadow-soft">
            <Settings className="size-5 text-text-secondary" strokeWidth={1.75} />
            <span className="flex-1 text-body font-semibold">Settings, billing & privacy</span>
            <ChevronRight className="size-5 text-text-secondary" />
          </Link>
        </div>
      )}

      <BottomSheet open={inviteOpen} onOpenChange={setInviteOpen} title="Invite an adult" description="They'll get an email link that expires in 7 days.">
        {atLimit ? (
          <div className="flex flex-col gap-4">
            <p className="text-body text-text-secondary">
              {plan.name} includes up to {plan.adultLimit} adults. Upgrade to invite more family members.
            </p>
            <Link href="/settings/subscription" className="inline-flex min-h-12 items-center justify-center rounded-button bg-primary font-semibold text-white" onClick={() => setInviteOpen(false)}>
              See plans
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Email address" error={error}>
              {(p) => <Input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />}
            </Field>
            <Field label="Role">
              {(p) => (
                <Select {...p} value={role} onChange={(e) => setRole(e.target.value as "admin" | "member")}>
                  <option value="member">Member — plan, create and complete tasks</option>
                  <option value="admin">Admin — also manage members and settings</option>
                </Select>
              )}
            </Field>
            <Button block onClick={invite}>Send invitation</Button>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={dependantOpen} onOpenChange={setDependantOpen} title="Add a child" description="Children appear in plans but don't sign in.">
        <div className="flex flex-col gap-4">
          <Field label="Name">{(p) => <Input {...p} value={depName} maxLength={100} onChange={(e) => setDepName(e.target.value)} placeholder="Ava" />}</Field>
          <Field label="Note (optional)" hint="For example, their age or school year.">{(p) => <Input {...p} value={depNote} onChange={(e) => setDepNote(e.target.value)} placeholder="8 years" />}</Field>
          <Button
            block
            disabled={!depName.trim()}
            onClick={() => {
              dispatch({ type: "addDependant", name: depName.trim(), note: depNote.trim() || undefined });
              toast({ tone: "success", title: `${depName.trim()} added` });
              setDepName("");
              setDepNote("");
              setDependantOpen(false);
            }}
          >
            Add child
          </Button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`Remove ${removing?.name}?`}
        body={removing?.kind === "adult" ? "They'll lose access to your household immediately. Their tasks become unassigned." : "They'll be removed from all plans."}
        confirmLabel="Remove"
        onConfirm={() => {
          if (removing) {
            dispatch({ type: "removeMember", id: removing.id });
            toast({ tone: "success", title: `${removing.name} removed` });
          }
        }}
      />
    </Screen>
  );
}
