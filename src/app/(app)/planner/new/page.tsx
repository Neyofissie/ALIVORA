"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { EventFormView } from "@/components/forms/EventFormView";
import { ScreenSkeleton } from "@/components/ui/Feedback";
import { newId, useStore } from "@/lib/store";

function NewEvent() {
  const router = useRouter();
  const { ready, today, currentUser, dispatch, toast } = useStore();
  const date = useSearchParams().get("date") ?? today;
  if (!ready) return <ScreenSkeleton />;
  return (
    <EventFormView
      submitLabel="Save event"
      initial={{ title: "", date, startTime: "09:00", endTime: "10:00", allDay: false, location: "", category: "family", participantIds: [currentUser.id], repeat: "none" }}
      onSubmit={(v) => {
        dispatch({
          type: "addEvent",
          event: {
            id: newId("e"),
            title: v.title,
            date: v.date,
            startTime: v.allDay ? "00:00" : v.startTime,
            endTime: v.allDay ? "23:59" : v.endTime,
            allDay: v.allDay,
            location: v.location || undefined,
            category: v.category,
            participantIds: v.participantIds,
            recurrence: v.repeat === "none" ? undefined : { frequency: v.repeat },
            exceptions: [],
            reminderMinutes: v.reminderMinutes,
            createdBy: currentUser.id,
          },
        });
        toast({ tone: "info", title: "Event created", body: "Added to the family calendar" });
        router.push(`/planner`);
      }}
    />
  );
}

export default function NewEventPage() {
  return (
    <Screen>
      <SubHeader title="New event" />
      <Suspense fallback={<ScreenSkeleton />}>
        <NewEvent />
      </Suspense>
    </Screen>
  );
}
