"use client";

import Link from "next/link";
import { CalendarPlus, CalendarX2, ListPlus, PartyPopper, Sparkles, Sun } from "lucide-react";
import { TabHeader } from "@/components/layout/TopBar";
import { Screen, SectionHeader } from "@/components/layout/Screen";
import { SectionBoundary } from "@/components/layout/SectionBoundary";
import { TomorrowReadyCard } from "@/components/cards/TomorrowReadyCard";
import { EventCard } from "@/components/cards/EventCard";
import { TaskCard } from "@/components/cards/TaskCard";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState, ProgressBar, ScreenSkeleton } from "@/components/ui/Feedback";
import { briefingHeadline } from "@/lib/briefing";
import { formatDayLong, greetingFor } from "@/lib/dates";
import { useBriefing, useOccurrences } from "@/lib/hooks";
import { useStore } from "@/lib/store";

const QUICK_ACTIONS = [
  { href: "/planner/new", label: "Add event", icon: CalendarPlus },
  { href: "/tasks/new", label: "Add task", icon: ListPlus },
  { href: "/ai", label: "Ask Alivora", icon: Sparkles },
  { href: "/tomorrow", label: "View tomorrow", icon: Sun },
];

export default function HomePage() {
  const { ready, state, today, tomorrow, nowTime, currentUser, memberById, dispatch, toast } = useStore();
  const briefing = useBriefing(tomorrow);
  const todayEvents = useOccurrences(today, today);

  const myTasks = state.tasks
    .filter((t) => t.assigneeId === currentUser.id && t.status === "pending" && (t.dueDate === null || t.dueDate <= tomorrow))
    .sort((a, b) => (a.dueDate ?? "9").localeCompare(b.dueDate ?? "9"));
  const active = state.tasks.filter((t) => t.status !== "archived");
  const done = active.filter((t) => t.status === "completed").length;

  return (
    <Screen>
      <TabHeader
        title={
          <div>
            <p className="text-caption text-text-secondary">{ready ? formatDayLong(today) : " "}</p>
            <h1 className="truncate text-h3 font-semibold">
              {ready ? `${greetingFor(nowTime)}, ${currentUser.name}` : "Welcome"}
            </h1>
          </div>
        }
      />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <div className="flex flex-col gap-7">
          <SectionBoundary name="Tomorrow Ready">
            <TomorrowReadyCard headline={briefingHeadline(briefing)} events={briefing.summary.events} tasks={briefing.summary.tasks} />
          </SectionBoundary>

          <nav aria-label="Quick actions" className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex flex-col items-center gap-2 rounded-card py-2 text-center text-caption font-medium text-text-primary hover:bg-primary-soft">
                <span className="flex size-12 items-center justify-center rounded-full bg-surface text-primary shadow-soft">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                {label}
              </Link>
            ))}
          </nav>

          <SectionBoundary name="today's events">
            <section>
              <SectionHeader title="Today" action={<Link href="/planner" className="text-body font-semibold text-primary">See all</Link>} />
              {todayEvents.length === 0 ? (
                <EmptyState icon={CalendarX2} title="Nothing planned today" body="Enjoy the breathing space, or add something for the family." />
              ) : (
                <div className="flex flex-col gap-3">
                  {todayEvents.map((e) => (
                    <EventCard key={`${e.id}-${e.occurrenceDate}`} event={e} participants={e.participantIds.map(memberById).filter((m) => !!m)} compact />
                  ))}
                </div>
              )}
            </section>
          </SectionBoundary>

          <SectionBoundary name="your tasks">
            <section>
              <SectionHeader title="Your tasks" action={<Link href="/tasks" className="text-body font-semibold text-primary">See all</Link>} />
              {myTasks.length === 0 ? (
                <EmptyState icon={PartyPopper} title="You're all caught up" body="No tasks are waiting on you right now." />
              ) : (
                <div className="flex flex-col gap-2">
                  {myTasks.slice(0, 4).map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      today={today}
                      assignee={memberById(t.assigneeId)}
                      onToggle={(c) => {
                        dispatch({ type: "setTaskStatus", id: t.id, status: c ? "completed" : "pending" });
                        if (c) toast({ tone: "success", title: "Task completed", body: "Great job!" });
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </SectionBoundary>

          <section className="rounded-card bg-surface p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-body font-semibold">Household progress</h2>
              <span className="text-caption text-text-secondary">{done} of {active.length} tasks done</span>
            </div>
            <ProgressBar value={active.length ? done / active.length : 0} label="Household task progress" />
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                {state.members.filter((m) => m.status === "active").map((m) => <Avatar key={m.id} member={m} size="sm" ring />)}
              </div>
              <Link href="/family" className="text-body font-semibold text-primary">Family</Link>
            </div>
          </section>
        </div>
      )}
    </Screen>
  );
}
