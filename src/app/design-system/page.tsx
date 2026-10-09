"use client";

import { useState } from "react";
import {
  ArrowRight, Bell, CalendarDays, House, Mail, MessageSquare, Settings, Sparkles, SquareCheckBig, Users,
} from "lucide-react";
import { AppIcon, Logo } from "@/components/layout/Logo";
import { SubHeader } from "@/components/layout/TopBar";
import { Avatar, AvatarGroup } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Checkbox, RadioGroup, SegmentedTabs, Switch } from "@/components/ui/Controls";
import { Field, Input, Select } from "@/components/ui/Field";
import { Alert, EmptyState, Skeleton } from "@/components/ui/Feedback";
import { TomorrowReadyCard } from "@/components/cards/TomorrowReadyCard";
import { EventCard } from "@/components/cards/EventCard";
import { TaskCard } from "@/components/cards/TaskCard";
import { AiProposalCard } from "@/components/cards/AiProposalCard";
import { HouseholdCard, SubscriptionCard } from "@/components/cards/HouseholdCard";
import { seedMembers } from "@/lib/mock/seed";

const COLOURS = [
  ["Primary", "Deep Plum", "#352C4F"],
  ["Secondary", "Soft Lavender", "#B8A7DB"],
  ["Background", "Warm Ivory", "#F8F6F2"],
  ["Surface", "White", "#FFFFFF"],
  ["Success", "Sage Green", "#6F8F7B"],
  ["Accent", "Muted Rose", "#D7A89A"],
  ["Warning", "Warm Amber", "#B77928"],
  ["Error", "Deep Red", "#B42332"],
  ["Text Primary", "Charcoal", "#252333"],
  ["Text Secondary", "Slate", "#625F70"],
  ["Border", "Soft Grey", "#E8E5EB"],
] as const;

const TYPE = [
  ["Display", "text-display font-semibold font-display", "36/44 SemiBold"],
  ["H1", "text-h1 font-semibold", "30/38 SemiBold"],
  ["H2", "text-h2 font-semibold", "24/32 SemiBold"],
  ["H3", "text-h3 font-semibold", "20/28 SemiBold"],
  ["Body Large", "text-body-lg", "16/24 Regular"],
  ["Body", "text-body", "14/22 Regular"],
  ["Caption", "text-caption font-medium", "12/18 Medium"],
] as const;

const ICONS = [
  [House, "Home"], [CalendarDays, "Calendar"], [SquareCheckBig, "Tasks"], [Users, "Family"],
  [Bell, "Notifications"], [MessageSquare, "Messages"], [Sparkles, "AI"], [Settings, "Settings"],
] as const;

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-feature bg-surface p-5 shadow-soft">
      <h2 className="mb-4 text-body-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const members = seedMembers();
  const [sw, setSw] = useState(true);
  const [cb, setCb] = useState(true);
  const [radio, setRadio] = useState<"1" | "2">("1");
  const [tab, setTab] = useState<"day" | "week" | "month" | "list">("day");
  const today = "2025-04-12";

  return (
    <main className="mx-auto w-full max-w-[1100px] px-5 pb-16">
      <div className="max-w-[480px]"><SubHeader title="Design system" backHref="/settings" /></div>
      <header className="mb-6">
        <Logo className="text-[56px] leading-none" />
        <p className="mt-2 font-display text-h3 font-medium text-text-secondary">Life, beautifully in sync.</p>
        <p className="mt-2 text-body text-text-secondary">Warm · Intelligent · Elegant · Reassuring — designed for real family life.</p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Block title="Colour palette">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
            {COLOURS.map(([token, name, hex]) => (
              <div key={token} className="flex flex-col items-center text-center">
                <span className="size-14 rounded-full border border-border" style={{ backgroundColor: hex }} />
                <span className="mt-2 text-caption font-semibold">{token}</span>
                <span className="text-[11px] text-text-secondary">{name}</span>
                <span className="text-[11px] text-text-secondary">{hex}</span>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Typography">
          <div className="mb-4 flex items-end gap-6">
            <div><p className="font-display text-[56px] leading-none font-semibold">Aa</p><p className="text-caption text-text-secondary">Playfair Display — display</p></div>
            <div><p className="text-[56px] leading-none font-semibold">Aa</p><p className="text-caption text-text-secondary">Inter — interface</p></div>
          </div>
          <ul className="flex flex-col gap-1">
            {TYPE.map(([name, cls, spec]) => (
              <li key={name} className="flex items-baseline justify-between gap-4">
                <span className={cls}>{name}</span>
                <span className="shrink-0 text-caption text-text-secondary">{spec}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Logo variations">
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-card bg-background px-5 py-3"><Logo className="text-[36px]" /></span>
            <span className="rounded-card bg-primary px-5 py-3"><Logo inverse className="text-[36px]" /></span>
            <AppIcon />
          </div>
        </Block>

        <Block title="Iconography (Lucide, 1.75 stroke)">
          <div className="grid grid-cols-4 gap-4">
            {ICONS.map(([Icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-1 text-caption text-text-secondary">
                <Icon className="size-7 text-primary" strokeWidth={1.75} /> {label}
              </div>
            ))}
          </div>
        </Block>

        <Block title="Spacing (8pt)">
          <div className="flex items-end gap-4">
            {[4, 8, 12, 16, 24, 32, 48].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1 text-caption text-text-secondary">
                <span className="bg-secondary/70" style={{ width: s, height: s }} /> {s}px
              </div>
            ))}
          </div>
        </Block>

        <Block title="Buttons">
          <div className="grid grid-cols-2 gap-3">
            <Button>Primary button <ArrowRight className="size-4" /></Button>
            <Button variant="secondary">Secondary button</Button>
            <Button variant="tertiary">Tertiary button</Button>
            <Button variant="destructive">Destructive button</Button>
            <Button disabled>Disabled</Button>
            <Button variant="tertiary" loading>Loading</Button>
          </div>
        </Block>

        <Block title="Form controls">
          <div className="flex flex-col gap-4">
            <Field label="Text input">{(p) => <Input {...p} icon={<Mail className="size-4" />} placeholder="Enter your email" />}</Field>
            <Field label="Select">{(p) => <Select {...p}><option>Choose an option</option></Select>}</Field>
            <Field label="Error state" error="Enter a valid email address">{(p) => <Input {...p} defaultValue="emma@" />}</Field>
            <div className="flex items-center gap-3"><Switch label="Switch" checked={sw} onChange={setSw} /> <span className="text-body">Switch</span></div>
            <Checkbox label="I agree to the terms" checked={cb} onChange={setCb} />
            <RadioGroup name="demo" className="flex-row gap-6" value={radio} onChange={setRadio} options={[{ value: "1", label: "Option 1" }, { value: "2", label: "Option 2" }]} />
          </div>
        </Block>

        <Block title="Navigation & avatars">
          <div className="flex flex-col gap-5">
            <SegmentedTabs label="Demo tabs" value={tab} onChange={setTab} options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }, { value: "list", label: "List" }]} />
            <div className="flex items-center gap-4">
              <AvatarGroup members={members} max={3} size="md" />
              {members.slice(0, 2).map((m) => <Avatar key={m.id} member={m} size="lg" />)}
            </div>
          </div>
        </Block>

        <Block title="Feedback">
          <div className="flex flex-col gap-2">
            <Alert tone="success" title="Task completed" body="Great job!" onDismiss={() => {}} />
            <Alert tone="info" title="Event created" body="Added to family calendar" onDismiss={() => {}} />
            <Alert tone="warning" title="Reminder" body="Pick up Ella at 3pm" onDismiss={() => {}} />
            <Alert tone="error" title="Unable to sync" body="Please check your connection" onDismiss={() => {}} />
          </div>
        </Block>

        <Block title="States">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-14 w-full" />
            <EmptyState icon={CalendarDays} title="Nothing planned" body="Add an event and it will appear here." />
          </div>
        </Block>

        <div className="md:col-span-2">
          <Block title="Cards">
            <div className="grid gap-4 md:grid-cols-2">
              <TomorrowReadyCard headline="Your family is nearly ready for tomorrow." events={3} tasks={4} />
              <div className="flex flex-col gap-3">
                <EventCard event={{ id: "demo", title: "Swim lesson", date: today, occurrenceDate: today, startTime: "08:00", endTime: "09:00", allDay: false, location: "Riverside Leisure Centre", category: "activity", participantIds: [], exceptions: [], createdBy: "m-emma" }} participants={members} />
                <TaskCard task={{ id: "demo", title: "Pack school bags", assigneeId: "m-emma", dueDate: "2025-04-13", priority: "high", status: "pending", repeat: "none", createdBy: "m-emma" }} assignee={members[0]} today={today} onToggle={() => {}} />
              </div>
              <AiProposalCard action={{ type: "create_event", title: "Dance class", local_date: "2025-04-13", start_local_time: "16:00", end_local_time: "17:00", participant_ids: ["m-ava"], timezone: "Europe/London" }} members={members} today={today} status="pending" onConfirm={() => {}} onReject={() => {}} />
              <div className="flex flex-col gap-3">
                <HouseholdCard name="Our Home" taskCount={12} members={members} />
                <SubscriptionCard planName="Alivora Free" />
              </div>
            </div>
          </Block>
        </div>
      </div>
    </main>
  );
}
