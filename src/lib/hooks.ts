"use client";

import { useMemo } from "react";
import { buildBriefing } from "./briefing";
import { occurrencesBetween } from "./recurrence";
import { useStore } from "./store";

export function useBriefing(date: string) {
  const { state } = useStore();
  return useMemo(
    () => buildBriefing({ date, events: state.events, tasks: state.tasks, members: state.members }),
    [date, state.events, state.tasks, state.members],
  );
}

export function useOccurrences(from: string, to: string) {
  const { state } = useStore();
  return useMemo(() => occurrencesBetween(state.events, from, to), [state.events, from, to]);
}
