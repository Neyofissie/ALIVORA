import type { EventOccurrence, FamilyEvent, Member, Task } from "./domain/types";
import { occurrencesOn } from "./recurrence";
import { weekdayName } from "./dates";

export type BriefingResponsibility = {
  id: string;
  label: string;
  assignee: Member | null;
  source: "task" | "event";
  href: string;
};

export type Briefing = {
  date: string;
  heading: string;
  events: EventOccurrence[];
  tasks: Task[];
  /** Suggestions only — never created automatically (PRD READY rules). */
  preparation: string[];
  responsibilities: BriefingResponsibility[];
  summary: { events: number; tasks: number; unassigned: number };
  generatedBy: "deterministic" | "ai";
};

/** Keyword rules for deterministic preparation suggestions. */
const PREPARATION_RULES: Array<[RegExp, string]> = [
  [/swim/i, "Pack the swimming bag."],
  [/school|drop-off|pickup|pick-up/i, "Check the school uniform and bags."],
  [/football|rugby|netball|sport|pe\b/i, "Pack sports kit and a water bottle."],
  [/dentist|doctor|gp|appointment|clinic/i, "Bring any appointment letters."],
  [/party|birthday/i, "Wrap the present and write the card."],
  [/trip|outing|visit/i, "Check travel times and pack snacks."],
  [/dance|ballet|music|piano|guitar/i, "Pack the class bag."],
];

/**
 * Builds Tomorrow Ready from authorised structured records only. It never
 * invents commitments and works without any AI provider (READY-006). AI can
 * later rewrite the wording, but not the facts.
 */
export function buildBriefing(input: {
  date: string;
  events: FamilyEvent[];
  tasks: Task[];
  members: Member[];
}): Briefing {
  const { date, members } = input;
  const byId = new Map(members.map((m) => [m.id, m]));
  const events = occurrencesOn(input.events, date);
  const tasks = input.tasks
    .filter((t) => t.status === "pending" && t.dueDate === date)
    .sort((a, b) => (a.dueTime ?? "99").localeCompare(b.dueTime ?? "99"));

  const preparation = new Set<string>();
  for (const e of events) {
    for (const [pattern, tip] of PREPARATION_RULES) if (pattern.test(e.title)) preparation.add(tip);
  }

  const responsibilities: BriefingResponsibility[] = tasks.map((t) => ({
    id: t.id,
    label: t.title,
    assignee: t.assigneeId ? (byId.get(t.assigneeId) ?? null) : null,
    source: "task",
    href: `/tasks/${t.id}`,
  }));

  return {
    date,
    heading: `Tomorrow Ready — ${weekdayName(date)}`,
    events,
    tasks,
    preparation: [...preparation],
    responsibilities,
    summary: {
      events: events.length,
      tasks: tasks.length,
      unassigned: responsibilities.filter((r) => !r.assignee).length,
    },
    generatedBy: "deterministic",
  };
}

export function briefingHeadline(b: Briefing): string {
  if (b.summary.events === 0 && b.summary.tasks === 0) return "Tomorrow looks clear. Enjoy the calm.";
  if (b.summary.unassigned > 0) return "Your family is nearly ready for tomorrow.";
  return "Your family is ready for tomorrow.";
}
