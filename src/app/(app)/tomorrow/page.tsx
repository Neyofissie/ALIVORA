"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, CheckCircle2, ClipboardList, Lightbulb, ListPlus, RefreshCw, Users } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { SunsetArch } from "@/components/cards/TomorrowReadyCard";
import { CategoryTile } from "@/components/cards/EventCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ScreenSkeleton } from "@/components/ui/Feedback";
import { briefingHeadline } from "@/lib/briefing";
import { formatDayLong, greetingFor } from "@/lib/dates";
import { newId, useStore } from "@/lib/store";
import { useBriefing } from "@/lib/hooks";

function Section({ icon: Icon, title, children }: { icon: typeof CalendarDays; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-surface p-4 shadow-soft">
      <h2 className="mb-3 flex items-center gap-2 text-body-lg font-semibold">
        <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden /> {title}
      </h2>
      {children}
    </section>
  );
}

export default function TomorrowPage() {
  const { ready, tomorrow, nowTime, memberById, dispatch, toast, currentUser } = useStore();
  const briefing = useBriefing(tomorrow);
  const [regenerating, setRegenerating] = useState(false);
  const [added, setAdded] = useState<string[]>([]);

  function addPrep(tip: string) {
    // Suggestions are never auto-created; the user explicitly adds each one.
    dispatch({
      type: "addTask",
      task: { id: newId("t"), title: tip.replace(/\.$/, ""), assigneeId: null, dueDate: tomorrow, priority: "normal", status: "pending", repeat: "none", createdBy: currentUser.id },
    });
    setAdded((a) => [...a, tip]);
    toast({ tone: "success", title: "Task added", body: "Added to tomorrow, unassigned." });
  }

  return (
    <Screen>
      <SubHeader title="Tomorrow Ready" backHref="/home" />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <section className="flex gap-3 overflow-hidden rounded-feature bg-primary p-5 text-white">
            <div className="min-w-0 flex-1">
              <p className="text-caption text-white/70">{formatDayLong(tomorrow)}</p>
              <h1 className="mt-1 font-display text-h2 font-medium">{briefing.heading}</h1>
              <p className="mt-2 text-body text-white/85">
                {greetingFor(nowTime)}! {briefingHeadline(briefing)}
              </p>
              <p className="mt-3 text-body text-white/90">
                {briefing.summary.events} events · {briefing.summary.tasks} tasks
                {briefing.summary.unassigned > 0 && ` · ${briefing.summary.unassigned} unassigned`}
              </p>
            </div>
            <SunsetArch className="w-[28%] max-w-[120px] shrink-0 self-stretch" />
          </section>

          <Section icon={CalendarDays} title="Schedule">
            {briefing.events.length === 0 ? (
              <p className="text-body text-text-secondary">No events tomorrow.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {briefing.events.map((e) => (
                  <li key={e.id}>
                    <Link href={`/planner/${e.id}?date=${e.occurrenceDate}`} className="flex min-h-14 items-center gap-3 py-2">
                      <CategoryTile category={e.category} tinted />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-semibold">{e.title}</span>
                        <span className="block text-caption text-text-secondary">{e.allDay ? "All day" : `${e.startTime} – ${e.endTime}`}</span>
                      </span>
                      <span className="flex -space-x-1.5">
                        {e.participantIds.slice(0, 3).map((id) => {
                          const m = memberById(id);
                          return m ? <Avatar key={id} member={m} size="xs" ring /> : null;
                        })}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section icon={Users} title="Responsibilities">
            {briefing.responsibilities.length === 0 ? (
              <p className="text-body text-text-secondary">No tasks due tomorrow.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {briefing.responsibilities.map((r) => (
                  <li key={r.id}>
                    <Link href={r.href} className="flex min-h-12 items-center justify-between gap-3 py-2">
                      <span className="truncate text-body">{r.label}</span>
                      {r.assignee ? (
                        <span className="flex shrink-0 items-center gap-2 text-caption text-text-secondary">
                          {r.assignee.name} <Avatar member={r.assignee} size="xs" />
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning">Unassigned</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section icon={Lightbulb} title="Things to prepare">
            {briefing.preparation.length === 0 ? (
              <p className="text-body text-text-secondary">Nothing extra to prepare.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {briefing.preparation.map((tip) => (
                  <li key={tip} className="flex items-center justify-between gap-3">
                    <span className="text-body">{tip}</span>
                    {added.includes(tip) ? (
                      <CheckCircle2 className="size-5 shrink-0 text-success" aria-label="Added" />
                    ) : (
                      <Button variant="tertiary" size="sm" className="shrink-0 px-3" onClick={() => addPrep(tip)} aria-label={`Add task: ${tip}`}>
                        <ListPlus className="size-4" /> Add
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-caption text-text-secondary">Suggestions are based on your confirmed plans. Nothing is added unless you choose it.</p>
          </Section>

          <div className="flex items-center justify-between gap-3 px-1 text-caption text-text-secondary">
            <span className="flex items-center gap-1.5">
              <ClipboardList className="size-4" /> Built from your household&apos;s confirmed plans
            </span>
            <Button
              variant="ghost"
              size="sm"
              loading={regenerating}
              onClick={() => {
                setRegenerating(true);
                setTimeout(() => {
                  setRegenerating(false);
                  toast({ tone: "info", title: "Briefing refreshed" });
                }, 600);
              }}
            >
              <RefreshCw className="size-4" /> Refresh
            </Button>
          </div>
        </div>
      )}
    </Screen>
  );
}
