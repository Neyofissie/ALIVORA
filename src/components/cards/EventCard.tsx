import Link from "next/link";
import { MapPin, Repeat } from "lucide-react";
import type { EventCategory, EventOccurrence, Member } from "@/lib/domain/types";
import { AvatarGroup } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

export const CATEGORY_STYLES: Record<EventCategory, { bar: string; label: string }> = {
  school: { bar: "bg-secondary", label: "School" },
  activity: { bar: "bg-accent", label: "Activity" },
  work: { bar: "bg-primary", label: "Work" },
  family: { bar: "bg-success", label: "Family" },
  health: { bar: "bg-warning", label: "Health" },
};

export function EventCard({
  event,
  participants,
  compact,
}: {
  event: EventOccurrence;
  participants: Member[];
  compact?: boolean;
}) {
  const style = CATEGORY_STYLES[event.category];
  return (
    <Link
      href={`/planner/${event.id}?date=${event.occurrenceDate}`}
      className="flex gap-3 rounded-card bg-surface p-4 shadow-soft transition-transform duration-[var(--motion-card)] active:scale-[0.99]"
    >
      <span className={cn("w-1 shrink-0 rounded-full", style.bar)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex items-center gap-1.5 text-caption font-medium text-text-secondary">
          {event.allDay ? "All day" : `${event.startTime} – ${event.endTime}`}
          {event.recurrence && <Repeat className="size-3" aria-label="Repeats" />}
          <span className="sr-only">, {style.label}</span>
        </p>
        <p className="truncate text-body-lg font-semibold text-text-primary">{event.title}</p>
        {event.location && !compact && (
          <p className="flex items-center gap-1 truncate text-body text-text-secondary">
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            {event.location}
          </p>
        )}
      </div>
      {participants.length > 0 && (
        <div className="self-end">
          <AvatarGroup members={participants} max={compact ? 2 : 3} size="xs" />
        </div>
      )}
    </Link>
  );
}
