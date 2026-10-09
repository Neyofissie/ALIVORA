import { z } from "zod";

/** ISO local date, e.g. 2026-10-10 (household-local, no timezone). */
export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
/** Local wall-clock time, e.g. 19:00. */
export const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");

export const roleSchema = z.enum(["owner", "admin", "member"]);
export type Role = z.infer<typeof roleSchema>;

export const memberSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  kind: z.enum(["adult", "dependant"]),
  /** Adults only — dependants cannot sign in in V1.0. */
  role: roleSchema.optional(),
  email: z.string().email().optional(),
  /** Shown on dependants, e.g. "8 years". Date of birth is not stored in V1.0. */
  note: z.string().optional(),
  colour: z.string(),
  status: z.enum(["active", "invited"]).default("active"),
});
export type Member = z.infer<typeof memberSchema>;

export const householdSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  timezone: z.string(),
  briefingLocalTime: localTimeSchema,
  cuisines: z.array(z.string()),
  plan: z.enum(["free", "plus", "ai"]),
});
export type Household = z.infer<typeof householdSchema>;

export const recurrenceSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly"]),
  /** Termination: never (both empty), on a date, or after N occurrences. */
  until: localDateSchema.optional(),
  count: z.number().int().positive().optional(),
});
export type Recurrence = z.infer<typeof recurrenceSchema>;

export const eventCategorySchema = z.enum(["school", "activity", "work", "family", "health"]);
export type EventCategory = z.infer<typeof eventCategorySchema>;

export const eventSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(150),
  description: z.string().optional(),
  /** Household-local start/end; converted with the household timezone. */
  date: localDateSchema,
  startTime: localTimeSchema,
  endTime: localTimeSchema,
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  category: eventCategorySchema,
  participantIds: z.array(z.string()),
  recurrence: recurrenceSchema.optional(),
  /** Local dates of cancelled occurrences of a recurring series. */
  exceptions: z.array(localDateSchema).default([]),
  reminderMinutes: z.number().int().nonnegative().optional(),
  createdBy: z.string(),
});
export type FamilyEvent = z.infer<typeof eventSchema>;

/** A concrete occurrence of an event on one local date. */
export type EventOccurrence = FamilyEvent & { occurrenceDate: string };

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Add a title").max(150, "Keep the title under 150 characters"),
    date: localDateSchema,
    startTime: localTimeSchema,
    endTime: localTimeSchema,
    allDay: z.boolean(),
    location: z.string().max(200).optional(),
    category: eventCategorySchema,
    participantIds: z.array(z.string()),
    repeat: z.enum(["none", "daily", "weekly", "monthly"]),
    reminderMinutes: z.number().int().nonnegative().optional(),
  })
  .refine((v) => v.allDay || v.endTime > v.startTime, {
    path: ["endTime"],
    message: "End time must be after the start time",
  });
export type EventForm = z.infer<typeof eventFormSchema>;

export const prioritySchema = z.enum(["low", "normal", "high"]);
export type Priority = z.infer<typeof prioritySchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(150),
  description: z.string().optional(),
  assigneeId: z.string().nullable(),
  dueDate: localDateSchema.nullable(),
  dueTime: localTimeSchema.optional(),
  priority: prioritySchema,
  status: z.enum(["pending", "completed", "archived"]),
  repeat: z.enum(["none", "daily", "weekly"]).default("none"),
  completedAt: z.string().optional(),
  createdBy: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

export const taskFormSchema = z.object({
  title: z.string().trim().min(1, "Add a title").max(150, "Keep the title under 150 characters"),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().nullable(),
  dueDate: localDateSchema.nullable(),
  dueTime: localTimeSchema.optional(),
  priority: prioritySchema,
  repeat: z.enum(["none", "daily", "weekly"]),
});
export type TaskForm = z.infer<typeof taskFormSchema>;

export type NotificationItem = {
  id: string;
  kind: "task" | "event" | "briefing" | "invite" | "billing";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};
