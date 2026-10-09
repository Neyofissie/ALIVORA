"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, endOfMonth, format, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { CalendarX2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { TabHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { EventCard } from "@/components/cards/EventCard";
import { IconButton, LinkButton } from "@/components/ui/Button";
import { SegmentedTabs } from "@/components/ui/Controls";
import { EmptyState, ScreenSkeleton } from "@/components/ui/Feedback";
import { formatDayLong, relativeDayLabel, shiftDate, shiftMonths } from "@/lib/dates";
import { useOccurrences } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";
import type { EventOccurrence } from "@/lib/domain/types";

type View = "day" | "week" | "month" | "list";
const iso = (d: Date) => format(d, "yyyy-MM-dd");

export default function PlannerPage() {
  const { ready, today, memberById } = useStore();
  const [view, setView] = useState<View>("month");
  const [selected, setSelected] = useState<string | null>(null);
  const date = selected ?? today;

  const monthStart = startOfMonth(parseISO(date));
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridDays = useMemo(() => {
    const days: string[] = [];
    const end = endOfMonth(monthStart);
    for (let d = gridStart; d <= end || days.length % 7 !== 0; d = addDays(d, 1)) days.push(iso(d));
    return days;
  }, [gridStart, monthStart]);

  const weekStart = iso(startOfWeek(parseISO(date), { weekStartsOn: 1 }));
  const rangeFrom = view === "month" ? gridDays[0]! : view === "week" ? weekStart : date;
  const rangeTo = view === "month" ? gridDays[gridDays.length - 1]! : view === "week" ? shiftDate(weekStart, 6) : view === "list" ? shiftDate(date, 30) : date;
  const occurrences = useOccurrences(rangeFrom, rangeTo);

  const byDate = useMemo(() => {
    const map = new Map<string, EventOccurrence[]>();
    for (const o of occurrences) map.set(o.occurrenceDate, [...(map.get(o.occurrenceDate) ?? []), o]);
    return map;
  }, [occurrences]);

  const step = (dir: 1 | -1) =>
    setSelected(view === "month" ? shiftMonths(date, dir) : view === "week" ? shiftDate(date, 7 * dir) : shiftDate(date, dir));

  const renderEvents = (items: EventOccurrence[]) => (
    <div className="flex flex-col gap-3">
      {items.map((e) => (
        <EventCard key={`${e.id}-${e.occurrenceDate}`} event={e} participants={e.participantIds.map(memberById).filter((m) => !!m)} />
      ))}
    </div>
  );

  const empty = (
    <EmptyState
      icon={CalendarX2}
      title="Nothing planned"
      body="Add an event and it will appear for everyone involved."
      action={<LinkButton href={`/planner/new?date=${date}`} size="sm" variant="secondary"><Plus className="size-4" /> Add event</LinkButton>}
    />
  );

  return (
    <Screen>
      <TabHeader
        title={<h1 className="text-h2 font-semibold">Planner</h1>}
        action={
          <Link href={`/planner/new?date=${date}`} aria-label="Add event" className="inline-flex size-11 items-center justify-center rounded-full hover:bg-primary-soft">
            <Plus className="size-6" strokeWidth={1.75} />
          </Link>
        }
      />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          <SegmentedTabs
            label="Planner view"
            value={view}
            onChange={setView}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "list", label: "List" },
            ]}
          />

          <div className="flex items-center justify-between">
            <IconButton label="Previous" onClick={() => step(-1)}><ChevronLeft className="size-5" /></IconButton>
            <h2 className="text-body-lg font-semibold" aria-live="polite">
              {view === "month" ? format(monthStart, "MMMM yyyy") : view === "week" ? `Week of ${format(parseISO(weekStart), "d MMM")}` : formatDayLong(date)}
            </h2>
            <IconButton label="Next" onClick={() => step(1)}><ChevronRight className="size-5" /></IconButton>
          </div>

          {view === "month" && (
            <>
              <div className="rounded-card bg-surface p-3 shadow-soft">
                <div className="grid grid-cols-7 text-center text-caption text-text-secondary" aria-hidden>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d} className="py-1">{d}</span>)}
                </div>
                <div role="grid" aria-label="Month" className="grid grid-cols-7">
                  {gridDays.map((d) => {
                    const inMonth = d.slice(0, 7) === date.slice(0, 7);
                    const count = byDate.get(d)?.length ?? 0;
                    const isSel = d === date;
                    return (
                      <button
                        key={d}
                        role="gridcell"
                        aria-selected={isSel}
                        aria-label={`${formatDayLong(d)}${count ? `, ${count} events` : ""}`}
                        onClick={() => setSelected(d)}
                        className="flex h-12 flex-col items-center justify-center gap-0.5"
                      >
                        <span
                          className={cn(
                            "flex size-8 items-center justify-center rounded-full text-body",
                            isSel ? "bg-primary font-semibold text-white" : d === today ? "font-semibold text-primary ring-1 ring-secondary" : inMonth ? "text-text-primary" : "text-text-secondary/50",
                          )}
                        >
                          {Number(d.slice(8))}
                        </span>
                        <span className={cn("size-1 rounded-full", count ? "bg-accent" : "bg-transparent")} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <section>
                <h3 className="mb-3 text-body font-semibold text-text-secondary">{relativeDayLabel(date, today)}</h3>
                {byDate.get(date)?.length ? renderEvents(byDate.get(date)!) : empty}
              </section>
            </>
          )}

          {view === "day" && (byDate.get(date)?.length ? renderEvents(byDate.get(date)!) : empty)}

          {(view === "week" || view === "list") &&
            (occurrences.length === 0 ? (
              empty
            ) : (
              <div className="flex flex-col gap-5">
                {[...byDate.entries()].map(([d, items]) => (
                  <section key={d}>
                    <h3 className="mb-2 text-body font-semibold text-text-secondary">{relativeDayLabel(d, today)} · {format(parseISO(d), "EEE d MMM")}</h3>
                    {renderEvents(items)}
                  </section>
                ))}
              </div>
            ))}
        </div>
      )}
    </Screen>
  );
}
