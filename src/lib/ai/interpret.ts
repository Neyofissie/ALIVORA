import type { FamilyEvent, Member } from "../domain/types";
import { parseProposal, type AiProposal, type ProposalAction } from "../domain/ai";
import { daysBetween, formatDayShort, shiftDate, weekdayName } from "../dates";
import { occurrencesBetween } from "../recurrence";

/**
 * Local stand-in for POST /api/v1/ai/interpret. It produces the same
 * structured proposal shape the AI orchestration service will return, and
 * runs it through the same schema validation, so the confirmation UI can be
 * built and tested before the OpenAI integration lands.
 */
export type InterpretContext = {
  today: string;
  timezone: string;
  currentUserId: string;
  members: Member[];
  events: FamilyEvent[];
};

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function nextWeekday(today: string, name: string): string {
  const target = WEEKDAYS.indexOf(name);
  for (let i = 1; i <= 7; i++) {
    const d = shiftDate(today, i);
    if (weekdayName(d).toLowerCase() === WEEKDAYS[target]) return d;
  }
  return shiftDate(today, 1);
}

function resolveDate(text: string, today: string): string | null {
  if (/\btomorrow\b/i.test(text)) return shiftDate(today, 1);
  if (/\btoday\b|\btonight\b/i.test(text)) return today;
  const day = WEEKDAYS.find((d) => new RegExp(`\\b${d}s?\\b`, "i").test(text));
  return day ? nextWeekday(today, day) : null;
}

function resolveTime(text: string): string | null {
  const m = text.match(/\bat (\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\b/i);
  if (!m) return null;
  let hour = Number(m[1]);
  const minutes = m[2] ?? "00";
  const meridiem = m[3]?.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (!meridiem && hour < 7) hour += 12;
  if (hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:${minutes}`;
}

function findMember(text: string, members: Member[], kind?: Member["kind"]) {
  return members.find(
    (m) => (!kind || m.kind === kind) && new RegExp(`\\b${m.name}\\b`, "i").test(text),
  );
}

function cleanTitle(raw: string): string {
  const stripped = raw
    .replace(/\b(?:(?:every|on|this|next|for)\s+)?(?:day|week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/gi, (m) =>
      /^(day|week)s?$/i.test(m) ? m : "",
    )
    .replace(/\b(tomorrow|today|tonight|daily|weekly)\b/gi, "")
    .replace(/\bat \d{1,2}([:.]\d{2})?\s*(am|pm)?\b/gi, "")
    .replace(/\bfor\b\s*$/i, "")
    .replace(/[.!?]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function addHour(time: string): string {
  const hour = Math.min(Number(time.slice(0, 2)) + 1, 23);
  return `${String(hour).padStart(2, "0")}${time.slice(2)}`;
}

function build(text: string, ctx: InterpretContext): unknown {
  const t = text.trim();
  const { today, timezone, members } = ctx;
  const adults = members.filter((m) => m.kind === "adult");

  if (/prepare for tomorrow|ready for tomorrow|tomorrow ready/i.test(t)) {
    return {
      intent: "generate_briefing",
      requires_confirmation: false,
      actions: [],
      message: "I've put together tomorrow's briefing from your family's confirmed plans.",
      warnings: [],
    };
  }

  if (/what'?s (happening|on)|what do we have|any plans/i.test(t)) {
    const weekend = /weekend/i.test(t);
    let from = today;
    let to = shiftDate(today, 6);
    if (weekend) {
      from = nextWeekday(shiftDate(today, -1), "saturday");
      to = shiftDate(from, 1);
    } else {
      const date = resolveDate(t, today);
      if (date) from = to = date;
    }
    const items = occurrencesBetween(ctx.events, from, to);
    const message = items.length
      ? items
          .map((e) => `${formatDayShort(e.occurrenceDate)} ${e.allDay ? "all day" : e.startTime} — ${e.title}`)
          .join("\n")
      : "Nothing is planned yet. Would you like to add something?";
    return { intent: "query_plans", requires_confirmation: false, actions: [], message, warnings: [] };
  }

  const time = resolveTime(t);
  const date = resolveDate(t, today);
  const repeat = /\bevery day\b|\bdaily\b/i.test(t)
    ? "daily"
    : /\bevery \w+day\b|\bweekly\b/i.test(t)
      ? "weekly"
      : "none";

  const looksLikeEvent =
    time && /\b(add|book|schedule|lesson|lessons|class|appointment|meeting|party|match)\b/i.test(t);
  if (looksLikeEvent && time) {
    const title = cleanTitle(t.replace(/^(please\s+)?(add|book|schedule)\s+/i, ""));
    const participants = members.filter((m) => new RegExp(`\\b${m.name}\\b`, "i").test(t));
    const actions: ProposalAction[] = [
      {
        type: "create_event",
        title: cleanTitle(title.replace(new RegExp(`\\b(for )?(${members.map((m) => m.name).join("|")})\\b`, "gi"), "")),
        local_date: date ?? shiftDate(today, 1),
        start_local_time: time,
        end_local_time: addHour(time),
        participant_ids: participants.map((p) => p.id),
        timezone,
      },
    ];
    const warnings = date ? [] : ["No day was mentioned, so I've suggested tomorrow."];
    return { intent: "create_event", requires_confirmation: true, actions, warnings };
  }

  const delegated = t.match(/^(?:please\s+)?(remind|ask|tell|get)\s+(\w+)\s+to\s+(.+)$/i);
  const selfTask = t.match(/^(?:please\s+)?(?:remind me to|i need to|add a task to|add task)\s+(.+)$/i);
  const imperative = t.match(/^(?:please\s+)?((?:prepare|pack|buy|book|call|clean|wash|collect|pick up|drop off|take|make|order|check)\b.+)$/i);

  if (delegated || selfTask || imperative) {
    let assigneeId: string | null = null;
    let body: string;
    const warnings: string[] = [];
    if (delegated) {
      const who = delegated[2]!;
      body = delegated[3]!;
      if (/^me$/i.test(who)) assigneeId = ctx.currentUserId;
      else {
        const match = findMember(who, adults);
        if (match) assigneeId = match.id;
        else if (findMember(who, members, "dependant"))
          warnings.push(`${who} has a dependent profile, so the task is left unassigned for an adult to pick up.`);
        else warnings.push(`I couldn't find "${who}" in your household, so the task is unassigned.`);
      }
    } else {
      body = (selfTask?.[1] ?? imperative?.[1])!;
      assigneeId = selfTask ? ctx.currentUserId : null;
    }

    const parts = imperative && !delegated ? body.split(/\s+and\s+/i) : [body];
    const actions: ProposalAction[] = parts.map((p) => ({
      type: "create_task",
      title: cleanTitle(p),
      assignee_id: assigneeId,
      due_local_date: date ?? (repeat === "none" ? null : today),
      due_local_time: time,
      repeat,
      timezone,
    }));
    const intent =
      actions.length > 1
        ? "create_multiple_tasks"
        : repeat !== "none"
          ? "create_recurring_task"
          : delegated
            ? "assign_task"
            : "create_task";
    return { intent, requires_confirmation: true, actions, warnings };
  }

  return {
    intent: "clarify",
    requires_confirmation: false,
    actions: [],
    message:
      "I can help create tasks and events, or tell you what's planned. Try “Add swimming lessons for Saturday at 10” or “Remind James to take out the bins every Thursday”.",
    warnings: [],
  };
}

export function interpret(text: string, ctx: InterpretContext): AiProposal | null {
  const parsed = parseProposal(build(text, ctx));
  return parsed.ok ? parsed.proposal : null;
}

/** Human summary of how far away a date is, for proposal cards. */
export function dueLabel(date: string | null, today: string): string {
  if (!date) return "No due date";
  const diff = daysBetween(today, date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return formatDayShort(date);
}
