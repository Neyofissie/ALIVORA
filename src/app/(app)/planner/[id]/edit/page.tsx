"use client";

import { useParams, useRouter } from "next/navigation";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { EventFormView } from "@/components/forms/EventFormView";
import { EmptyState, ScreenSkeleton } from "@/components/ui/Feedback";
import { CalendarX2 } from "lucide-react";
import { useStore } from "@/lib/store";

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { ready, state, dispatch, toast } = useStore();
  const event = state.events.find((e) => e.id === id);

  return (
    <Screen>
      <SubHeader title="Edit event" />
      {!ready ? (
        <ScreenSkeleton />
      ) : !event ? (
        <EmptyState icon={CalendarX2} title="Event not found" body="It may have been deleted by another family member." />
      ) : (
        <EventFormView
          submitLabel="Save changes"
          initial={{
            title: event.title,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            allDay: event.allDay,
            location: event.location ?? "",
            category: event.category,
            participantIds: event.participantIds,
            repeat: event.recurrence?.frequency ?? "none",
            reminderMinutes: event.reminderMinutes,
          }}
          onSubmit={(v) => {
            dispatch({
              type: "updateEvent",
              event: {
                ...event,
                title: v.title,
                date: v.date,
                startTime: v.allDay ? "00:00" : v.startTime,
                endTime: v.allDay ? "23:59" : v.endTime,
                allDay: v.allDay,
                location: v.location || undefined,
                category: v.category,
                participantIds: v.participantIds,
                recurrence: v.repeat === "none" ? undefined : { ...event.recurrence, frequency: v.repeat },
                reminderMinutes: v.reminderMinutes,
              },
            });
            toast({ tone: "success", title: "Event updated" });
            router.push(`/planner/${event.id}`);
          }}
        />
      )}
    </Screen>
  );
}
