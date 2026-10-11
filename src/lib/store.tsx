"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { FamilyEvent, Household, Member, NotificationItem, Task } from "./domain/types";
import { localDate, localTime, shiftDate } from "./dates";
import {
  CURRENT_USER_ID,
  seedEvents,
  seedHousehold,
  seedMembers,
  seedNotifications,
  seedTasks,
} from "./mock/seed";

/**
 * Client-side household store backed by mock data. It mirrors the shape of
 * the V1.0 API (households, members, events, tasks, notifications) so the
 * screens can switch to Supabase-backed queries without restructuring.
 */
export type State = {
  version: 1;
  onboarded: boolean;
  household: Household;
  members: Member[];
  events: FamilyEvent[];
  tasks: Task[];
  notifications: NotificationItem[];
};

type Action =
  | { type: "reset"; state: State }
  | { type: "completeOnboarding"; household: Partial<Household>; invites: string[] }
  | { type: "updateHousehold"; patch: Partial<Household> }
  | { type: "addEvent"; event: FamilyEvent }
  | { type: "updateEvent"; event: FamilyEvent }
  | { type: "deleteEvent"; id: string; occurrence?: string }
  | { type: "addTask"; task: Task }
  | { type: "updateTask"; task: Task }
  | { type: "setTaskStatus"; id: string; status: Task["status"] }
  | { type: "deleteTask"; id: string }
  | { type: "inviteMember"; email: string; role: "admin" | "member" }
  | { type: "addDependant"; name: string; note?: string }
  | { type: "removeMember"; id: string }
  | { type: "markNotificationsRead"; id?: string };

const STORAGE_KEY = "alivora:v1";
const PALETTE = ["#B8A7DB", "#A9BFAF", "#D7A89A", "#E8C48F", "#A9C2E0"];

export function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function initialState(today: string): State {
  return {
    version: 1,
    onboarded: false,
    household: seedHousehold(),
    members: seedMembers(),
    events: seedEvents(today),
    tasks: seedTasks(today),
    notifications: seedNotifications(),
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return action.state;
    case "completeOnboarding": {
      const invited: Member[] = action.invites.map((email, i) => ({
        id: newId("m"),
        name: email.split("@")[0] ?? email,
        email,
        kind: "adult",
        role: "member",
        colour: PALETTE[(state.members.length + i) % PALETTE.length]!,
        status: "invited",
      }));
      return {
        ...state,
        onboarded: true,
        household: { ...state.household, ...action.household },
        members: [...state.members, ...invited],
      };
    }
    case "updateHousehold":
      return { ...state, household: { ...state.household, ...action.patch } };
    case "addEvent":
      return { ...state, events: [...state.events, action.event] };
    case "updateEvent":
      return { ...state, events: state.events.map((e) => (e.id === action.event.id ? action.event : e)) };
    case "deleteEvent":
      if (action.occurrence) {
        return {
          ...state,
          events: state.events.map((e) =>
            e.id === action.id ? { ...e, exceptions: [...e.exceptions, action.occurrence!] } : e,
          ),
        };
      }
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };
    case "addTask":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "updateTask":
      return { ...state, tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)) };
    case "setTaskStatus": {
      const task = state.tasks.find((t) => t.id === action.id);
      if (!task) return state;
      const updated: Task = {
        ...task,
        status: action.status,
        completedAt: action.status === "completed" ? new Date().toISOString() : undefined,
      };
      let tasks = state.tasks.map((t) => (t.id === task.id ? updated : t));
      // Recurring tasks keep a separate completion state per occurrence:
      // completing one schedules the next occurrence as pending.
      if (action.status === "completed" && task.repeat !== "none" && task.dueDate) {
        const nextDue = shiftDate(task.dueDate, task.repeat === "daily" ? 1 : 7);
        const exists = tasks.some((t) => t.title === task.title && t.dueDate === nextDue && t.repeat === task.repeat);
        if (!exists) tasks = [...tasks, { ...task, id: newId("t"), dueDate: nextDue, status: "pending", completedAt: undefined }];
      }
      return { ...state, tasks };
    }
    case "deleteTask":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "inviteMember":
      return {
        ...state,
        members: [
          ...state.members,
          {
            id: newId("m"),
            name: action.email.split("@")[0] ?? action.email,
            email: action.email,
            kind: "adult",
            role: action.role,
            colour: PALETTE[state.members.length % PALETTE.length]!,
            status: "invited",
          },
        ],
      };
    case "addDependant":
      return {
        ...state,
        members: [
          ...state.members,
          {
            id: newId("m"),
            name: action.name,
            note: action.note,
            kind: "dependant",
            colour: PALETTE[state.members.length % PALETTE.length]!,
            status: "active",
          },
        ],
      };
    case "removeMember":
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.id),
        tasks: state.tasks.map((t) => (t.assigneeId === action.id ? { ...t, assigneeId: null } : t)),
        events: state.events.map((e) => ({ ...e, participantIds: e.participantIds.filter((p) => p !== action.id) })),
      };
    case "markNotificationsRead":
      return {
        ...state,
        notifications: state.notifications.map((n) => (!action.id || n.id === action.id ? { ...n, read: true } : n)),
      };
  }
}

export type Toast = { id: string; tone: "success" | "info" | "warning" | "error"; title: string; body?: string };

type StoreValue = {
  ready: boolean;
  state: State;
  dispatch: React.Dispatch<Action>;
  today: string;
  tomorrow: string;
  nowTime: string;
  currentUser: Member;
  memberById: (id: string | null | undefined) => Member | undefined;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

function loadState(today: string): State {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed.version === 1) return parsed;
    }
  } catch {
    // Storage unavailable (private mode) — fall back to seed data.
  }
  return initialState(today);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [clock, setClock] = useState(() => new Date());
  const timezone = "Europe/London";
  const today = localDate(clock, timezone);
  const [state, dispatch] = useReducer(reducer, today, initialState);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    dispatch({ type: "reset", state: loadState(localDate(new Date(), timezone)) });
    setClock(new Date());
    setReady(true);
    const timer = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore — persistence is a demo convenience only.
    }
  }, [state, ready]);

  const dismissToast = useCallback((id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = newId("toast");
      setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismissToast(id), 4000);
    },
    [dismissToast],
  );

  const resetDemo = useCallback(() => {
    const fresh = initialState(localDate(new Date(), timezone));
    dispatch({ type: "reset", state: { ...fresh, onboarded: true } });
  }, []);

  const value = useMemo<StoreValue>(() => {
    const byId = new Map(state.members.map((m) => [m.id, m]));
    return {
      ready,
      state,
      dispatch,
      today,
      tomorrow: shiftDate(today, 1),
      nowTime: localTime(clock, timezone),
      currentUser: byId.get(CURRENT_USER_ID) ?? state.members[0]!,
      memberById: (id) => (id ? byId.get(id) : undefined),
      toasts,
      toast,
      dismissToast,
      resetDemo,
    };
  }, [ready, state, today, clock, toasts, toast, dismissToast, resetDemo]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
