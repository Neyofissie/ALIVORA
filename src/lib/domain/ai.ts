import { z } from "zod";
import { localDateSchema, localTimeSchema } from "./types";

/**
 * Structured proposal returned by the AI orchestration service (PRD §6.7).
 * Model output is never trusted for IDs: the server resolves participants
 * and generates record IDs on confirmation.
 */
export const createTaskActionSchema = z.object({
  type: z.literal("create_task"),
  title: z.string().min(1).max(150),
  assignee_id: z.string().nullable(),
  due_local_date: localDateSchema.nullable(),
  due_local_time: localTimeSchema.nullable(),
  repeat: z.enum(["none", "daily", "weekly"]).default("none"),
  timezone: z.string(),
});

export const createEventActionSchema = z.object({
  type: z.literal("create_event"),
  title: z.string().min(1).max(150),
  local_date: localDateSchema,
  start_local_time: localTimeSchema,
  end_local_time: localTimeSchema,
  participant_ids: z.array(z.string()),
  timezone: z.string(),
});

export const proposalActionSchema = z.discriminatedUnion("type", [
  createTaskActionSchema,
  createEventActionSchema,
]);
export type ProposalAction = z.infer<typeof proposalActionSchema>;

export const aiProposalSchema = z.object({
  intent: z.enum([
    "create_task",
    "create_recurring_task",
    "create_multiple_tasks",
    "assign_task",
    "create_event",
    "query_plans",
    "generate_briefing",
    "clarify",
  ]),
  requires_confirmation: z.boolean(),
  actions: z.array(proposalActionSchema),
  /** Plain-language answer or clarification question, when there are no actions. */
  message: z.string().optional(),
  warnings: z.array(z.string()),
});
export type AiProposal = z.infer<typeof aiProposalSchema>;

/** Validates untrusted model output. Invalid output is rejected so the user can retry. */
export function parseProposal(raw: unknown): { ok: true; proposal: AiProposal } | { ok: false } {
  const result = aiProposalSchema.safeParse(raw);
  if (!result.success) return { ok: false };
  if (result.data.actions.length > 0 && !result.data.requires_confirmation) return { ok: false };
  return { ok: true, proposal: result.data };
}
