"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Bell, CalendarX2, Clock, MapPin, Repeat, Tag } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { CATEGORY_STYLES, CategoryTile } from "@/components/cards/EventCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState, ScreenSkeleton } from "@/components/ui/Feedback";
import { ConfirmDialog } from "@/components/ui/Sheet";
import { formatDayLong } from "@/lib/dates";
import { useStore } from "@/lib/store";

function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const occurrence = useSearchParams().get("date");
  const router = useRouter();
  const { ready, state, memberById, dispatch, toast } = useStore();
  const [confirm, setConfirm] = useState(false);
  const event = state.events.find((e) => e.id === id);

  if (!ready) return <ScreenSkeleton />;
  if (!event) return <EmptyState icon={CalendarX2} title="Event not found" body="It may have been deleted by another family member." />;

  const date = occurrence ?? event.date;
  const rows = [
    { icon: Clock, label: `${formatDayLong(date)}${event.allDay ? " · All day" : ` · ${event.startTime} – ${event.endTime}`}` },
    event.location && { icon: MapPin, label: event.location },
    event.recurrence && { icon: Repeat, label: `Repeats ${event.recurrence.frequency}` },
    event.reminderMinutes !== undefined && { icon: Bell, label: event.reminderMinutes >= 1440 ? "Reminder 1 day before" : `Reminder ${event.reminderMinutes} min before` },
    { icon: Tag, label: CATEGORY_STYLES[event.category].label },
  ].filter((r): r is { icon: typeof Clock; label: string } => Boolean(r));

  return (
    <div className="flex flex-col gap-5">
      <section className={`rounded-card p-5 ${CATEGORY_STYLES[event.category].tint}`}>
        <CategoryTile category={event.category} className="mb-3" />
        <h1 className="text-h2 font-semibold">{event.title}</h1>
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-body text-text-secondary">
              <Icon className="size-5 shrink-0" strokeWidth={1.75} aria-hidden /> {label}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-card bg-surface p-5 shadow-soft">
        <h2 className="mb-3 text-body-lg font-semibold">Who&apos;s involved</h2>
        {event.participantIds.length === 0 ? (
          <p className="text-body text-text-secondary">No one added yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {event.participantIds.map((pid) => {
              const m = memberById(pid);
              return m ? (
                <li key={pid} className="flex items-center gap-3">
                  <Avatar member={m} size="sm" /> <span className="text-body">{m.name}</span>
                </li>
              ) : null;
            })}
          </ul>
        )}
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="destructive" onClick={() => setConfirm(true)}>Delete</Button>
        <LinkButton href={`/planner/${event.id}/edit`} variant="primary">Edit</LinkButton>
      </div>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={event.recurrence ? "Delete recurring event?" : "Delete this event?"}
        body={event.recurrence ? "Delete just this occurrence, or every event in the series." : "This removes it from everyone's calendar."}
        confirmLabel={event.recurrence ? "Delete entire series" : "Delete event"}
        onConfirm={() => {
          dispatch({ type: "deleteEvent", id: event.id });
          toast({ tone: "success", title: "Event deleted" });
          router.push("/planner");
        }}
        extraAction={
          event.recurrence
            ? {
                label: "Delete this occurrence only",
                onClick: () => {
                  dispatch({ type: "deleteEvent", id: event.id, occurrence: date });
                  toast({ tone: "success", title: "Occurrence deleted" });
                  router.push("/planner");
                },
              }
            : undefined
        }
      />
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <Screen>
      <SubHeader title="Event" />
      <Suspense fallback={<ScreenSkeleton />}>
        <EventDetail />
      </Suspense>
    </Screen>
  );
}
