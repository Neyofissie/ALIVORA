import type { FamilyEvent, Household, Member, NotificationItem, Task } from "../domain/types";
import { shiftDate } from "../dates";

/**
 * Illustrative household used until Supabase is wired up. Dates are generated
 * relative to "today" so the app always has a realistic week of plans.
 */
export const CURRENT_USER_ID = "m-emma";

export function seedHousehold(): Household {
  return {
    id: "h-williams",
    name: "Our Home",
    timezone: "Europe/London",
    briefingLocalTime: "19:00",
    cuisines: ["nigerian", "scottish", "indian"],
    plan: "free",
  };
}

export function seedMembers(): Member[] {
  return [
    { id: "m-emma", name: "Emma", kind: "adult", role: "owner", email: "emma@example.com", colour: "#B8A7DB", status: "active" },
    { id: "m-james", name: "James", kind: "adult", role: "admin", email: "james@example.com", colour: "#A9BFAF", status: "active" },
    { id: "m-ava", name: "Ava", kind: "dependant", note: "8 years", colour: "#D7A89A", status: "active" },
    { id: "m-noah", name: "Noah", kind: "dependant", note: "5 years", colour: "#E8C48F", status: "active" },
  ];
}

export function seedEvents(today: string): FamilyEvent[] {
  const t = (n: number) => shiftDate(today, n);
  const base = { allDay: false, exceptions: [], createdBy: CURRENT_USER_ID };
  return [
    { ...base, id: "e-swim-today", title: "Swim lesson", date: t(0), startTime: "08:00", endTime: "09:00", location: "Riverside Leisure Centre", category: "activity", participantIds: ["m-emma", "m-james", "m-ava", "m-noah"], reminderMinutes: 30 },
    { ...base, id: "e-maths", title: "Maths homework club", date: t(0), startTime: "16:30", endTime: "17:30", location: "Home", category: "school", participantIds: ["m-ava"] },
    { ...base, id: "e-dance", title: "Dance class", date: t(0), startTime: "18:00", endTime: "19:00", location: "The Dance Studio", category: "activity", participantIds: ["m-ava", "m-emma"] },
    { ...base, id: "e-dropoff", title: "School drop-off", date: t(1), startTime: "08:30", endTime: "09:00", location: "Oakfield Primary", category: "school", participantIds: ["m-james", "m-ava", "m-noah"] },
    { ...base, id: "e-meeting", title: "Work meeting", date: t(1), startTime: "10:00", endTime: "11:00", category: "work", participantIds: ["m-emma"] },
    { ...base, id: "e-pickup", title: "School pickup", date: t(1), startTime: "15:20", endTime: "15:45", location: "Oakfield Primary", category: "school", participantIds: ["m-emma", "m-ava", "m-noah"] },
    { ...base, id: "e-swim", title: "Swimming lessons", date: t(1), startTime: "17:00", endTime: "17:45", location: "Riverside Leisure Centre", category: "activity", participantIds: ["m-ava"], reminderMinutes: 60 },
    { ...base, id: "e-football", title: "Football training", date: t(2), startTime: "17:00", endTime: "18:00", location: "Park Lane Fields", category: "activity", participantIds: ["m-noah", "m-james"], recurrence: { frequency: "weekly" } },
    { ...base, id: "e-dentist", title: "Dentist appointment", date: t(3), startTime: "11:15", endTime: "11:45", location: "Bridge Street Dental", category: "health", participantIds: ["m-noah", "m-emma"] },
    { ...base, id: "e-grandma", title: "Lunch at Grandma's", date: t(5), startTime: "12:30", endTime: "15:00", category: "family", participantIds: ["m-emma", "m-james", "m-ava", "m-noah"] },
  ];
}

export function seedTasks(today: string): Task[] {
  const t = (n: number) => shiftDate(today, n);
  const base = { createdBy: CURRENT_USER_ID, repeat: "none" as const };
  return [
    { ...base, id: "t-bags", title: "Pack school bags", assigneeId: "m-emma", dueDate: t(1), dueTime: "07:45", priority: "high", status: "pending" },
    { ...base, id: "t-lunch", title: "Prepare packed lunch", assigneeId: "m-james", dueDate: t(1), dueTime: "07:30", priority: "normal", status: "pending" },
    { ...base, id: "t-kit", title: "Confirm football kit", assigneeId: null, dueDate: t(1), priority: "normal", status: "pending" },
    { ...base, id: "t-homework", title: "Check maths homework", assigneeId: "m-emma", dueDate: t(0), dueTime: "18:30", priority: "normal", status: "pending" },
    { ...base, id: "t-donations", title: "Drop off donations", assigneeId: "m-james", dueDate: t(0), priority: "low", status: "pending" },
    { ...base, id: "t-library", title: "Return library books", assigneeId: "m-emma", dueDate: t(-1), priority: "normal", status: "pending" },
    { ...base, id: "t-bins", title: "Take out the bins", assigneeId: "m-james", dueDate: t(3), priority: "normal", status: "pending", repeat: "weekly" },
    { ...base, id: "t-shoes", title: "Buy school shoes", assigneeId: "m-emma", dueDate: t(4), priority: "normal", status: "pending" },
    { ...base, id: "t-form", title: "Sign school trip form", assigneeId: "m-emma", dueDate: t(-1), priority: "high", status: "completed", completedAt: new Date().toISOString() },
  ];
}

export function seedNotifications(): NotificationItem[] {
  const now = Date.now();
  return [
    { id: "n-1", kind: "briefing", title: "Tomorrow Ready", body: "Your briefing for tomorrow is ready.", createdAt: new Date(now - 30 * 60_000).toISOString(), read: false, href: "/tomorrow" },
    { id: "n-2", kind: "task", title: "Task assigned", body: "James assigned you “Pack school bags”.", createdAt: new Date(now - 3 * 3600_000).toISOString(), read: false, href: "/tasks/t-bags" },
    { id: "n-3", kind: "event", title: "Reminder", body: "Swim lesson starts at 08:00.", createdAt: new Date(now - 26 * 3600_000).toISOString(), read: true, href: "/planner/e-swim-today" },
  ];
}
