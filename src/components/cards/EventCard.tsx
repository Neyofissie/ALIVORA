import Link from "next/link";
import { Backpack, ChevronRight, Heart, Laptop, Repeat, Stethoscope, Trophy, type LucideIcon } from "lucide-react";
import type { EventCategory, EventOccurrence, Member } from "@/lib/domain/types";
import { AvatarGroup } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

/**
 * Each kind of plan has a tint (row background) and an ink (icon colour),
 * per the design system: sage = school runs, sky = work and appointments,
 * rose = activities, amber = family and home.
 */
export const CATEGORY_STYLES: Record<EventCategory, { label: string; tint: string; ink: string; icon: LucideIcon }> = {
  school: { label: "School", tint: "bg-success-soft", ink: "text-success", icon: Backpack },
  activity: { label: "Activity", tint: "bg-accent-soft", ink: "text-rose-ink", icon: Trophy },
  work: { label: "Work", tint: "bg-sky-soft", ink: "text-sky", icon: Laptop },
  family: { label: "Family", tint: "bg-warning-soft", ink: "text-warning", icon: Heart },
  health: { label: "Health", tint: "bg-sky-soft", ink: "text-sky", icon: Stethoscope },
};

/**
 * The 40px icon tile that starts a row: white on a tinted row, or carrying
 * the tint itself (`tinted`) when it sits on a plain surface.
 */
export function CategoryTile({ category, tinted, className }: { category: EventCategory; tinted?: boolean; className?: string }) {
  const { icon: Icon, ink, tint } = CATEGORY_STYLES[category];
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-input", tinted ? tint : "bg-surface", ink, className)} aria-hidden>
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}

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
  const time = event.allDay ? "All day" : `${event.startTime} – ${event.endTime}`;
  return (
    <Link
      href={`/planner/${event.id}?date=${event.occurrenceDate}`}
      className={cn(
        "flex items-center gap-3 rounded-card px-4 py-3 transition-transform duration-[var(--motion-card)] active:scale-[0.99]",
        style.tint,
      )}
    >
      <CategoryTile category={event.category} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate text-body-lg font-semibold text-text-primary">{event.title}</p>
        <p className="flex items-center gap-1.5 truncate text-caption font-medium text-text-secondary">
          <span>{time}</span>
          {event.location && !compact && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{event.location}</span>
            </>
          )}
          {event.recurrence && <Repeat className="size-3 shrink-0" aria-label="Repeats" />}
          <span className="sr-only">, {style.label}</span>
        </p>
      </div>
      {participants.length > 0 ? (
        <AvatarGroup members={participants} max={compact ? 2 : 3} size="xs" />
      ) : (
        <ChevronRight className="size-4 shrink-0 text-text-secondary" aria-hidden />
      )}
    </Link>
  );
}
