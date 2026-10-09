"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, Sun } from "lucide-react";
import { TabHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { AiProposalCard } from "@/components/cards/AiProposalCard";
import { Alert, ScreenSkeleton } from "@/components/ui/Feedback";
import { interpret } from "@/lib/ai/interpret";
import { proposalActionSchema, type AiProposal, type ProposalAction } from "@/lib/domain/ai";
import { newId, useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

type Message =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string; intent?: AiProposal["intent"]; warnings?: string[] }
  | { id: string; role: "proposal"; action: ProposalAction; status: "pending" | "confirmed" | "rejected" };

const SUGGESTIONS = [
  "Add swimming lessons for Saturday at 10",
  "Remind James to take out the bins every Thursday",
  "Prepare the school bags and pack lunch tomorrow",
  "What's happening this weekend?",
];

export default function AiPage() {
  const { ready, state, today, currentUser, dispatch, toast } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages, thinking]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setInput("");
    setMessages((m) => [...m, { id: newId("msg"), role: "user", text: trimmed }]);
    setThinking(true);
    // Simulates the round trip to POST /api/v1/ai/interpret.
    setTimeout(() => {
      const proposal = interpret(trimmed, {
        today,
        timezone: state.household.timezone,
        currentUserId: currentUser.id,
        members: state.members.filter((m) => m.status === "active"),
        events: state.events,
      });
      setThinking(false);
      if (!proposal) {
        setMessages((m) => [...m, { id: newId("msg"), role: "assistant", text: "Sorry, I couldn't understand that. Please try rephrasing." }]);
        return;
      }
      const intro =
        proposal.actions.length === 0
          ? proposal.message ?? ""
          : proposal.actions.length > 1
            ? `Here are ${proposal.actions.length} tasks I can create. Review them before anything is saved.`
            : "Here's what I can create. Review it before anything is saved.";
      setMessages((m) => [
        ...m,
        { id: newId("msg"), role: "assistant", text: intro, intent: proposal.intent, warnings: proposal.warnings },
        ...proposal.actions.map((action) => ({ id: newId("prop"), role: "proposal" as const, action, status: "pending" as const })),
      ]);
    }, 700);
  }

  function confirm(id: string, edited: ProposalAction) {
    // Revalidate before writing — edited proposals go through the same schema.
    const parsed = proposalActionSchema.safeParse(edited);
    if (!parsed.success) {
      toast({ tone: "error", title: "Please check the details", body: "Some fields are missing or invalid." });
      return;
    }
    const a = parsed.data;
    if (a.type === "create_task") {
      dispatch({
        type: "addTask",
        task: { id: newId("t"), title: a.title, assigneeId: a.assignee_id, dueDate: a.due_local_date, dueTime: a.due_local_time ?? undefined, priority: "normal", status: "pending", repeat: a.repeat, createdBy: currentUser.id },
      });
      toast({ tone: "success", title: "Task created", body: a.title });
    } else {
      if (a.end_local_time <= a.start_local_time) {
        toast({ tone: "error", title: "End time must be after the start time" });
        return;
      }
      dispatch({
        type: "addEvent",
        event: { id: newId("e"), title: a.title, date: a.local_date, startTime: a.start_local_time, endTime: a.end_local_time, allDay: false, category: "activity", participantIds: a.participant_ids, exceptions: [], createdBy: currentUser.id },
      });
      toast({ tone: "info", title: "Event created", body: "Added to family calendar" });
    }
    setMessages((m) => m.map((x) => (x.id === id && x.role === "proposal" ? { ...x, action: a, status: "confirmed" } : x)));
  }

  return (
    <Screen className="flex min-h-[calc(100dvh-7rem)] flex-col">
      <TabHeader
        title={
          <div>
            <h1 className="font-display text-h3 font-semibold">Alivora</h1>
            <p className="text-caption text-text-secondary">Your family planning assistant</p>
          </div>
        }
      />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <>
          <div className="flex flex-1 flex-col gap-3 pb-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-secondary-soft text-primary">
                  <Sparkles className="size-7" strokeWidth={1.75} />
                </span>
                <p className="text-body-lg font-semibold">How can I help your family today?</p>
                <p className="max-w-xs text-body text-text-secondary">
                  Describe plans in your own words. I&apos;ll suggest tasks or events — nothing is saved until you confirm.
                </p>
                <div className="mt-2 flex w-full flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)} className="min-h-11 rounded-card border border-border bg-surface px-4 py-2.5 text-left text-body hover:bg-primary-soft">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <p key={m.id} className="animate-fade-up ml-10 self-end rounded-[20px] rounded-br-md bg-secondary px-4 py-2.5 text-body text-primary">
                  {m.text}
                </p>
              ) : m.role === "assistant" ? (
                <div key={m.id} className="animate-fade-up mr-8 flex flex-col gap-2 self-start">
                  <p className="rounded-[20px] rounded-bl-md bg-surface px-4 py-2.5 text-body whitespace-pre-line shadow-soft">{m.text}</p>
                  {m.intent === "generate_briefing" && (
                    <Link href="/tomorrow" className="flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-body font-semibold text-white">
                      <Sun className="size-4" /> Open Tomorrow Ready
                    </Link>
                  )}
                  {m.warnings?.map((w) => <Alert key={w} tone="warning" title={w} />)}
                </div>
              ) : (
                <AiProposalCard
                  key={m.id}
                  action={m.action}
                  status={m.status}
                  members={state.members}
                  today={today}
                  onConfirm={(edited) => confirm(m.id, edited)}
                  onReject={() => setMessages((ms) => ms.map((x) => (x.id === m.id && x.role === "proposal" ? { ...x, status: "rejected" } : x)))}
                />
              ),
            )}
            {thinking && (
              <p className="flex items-center gap-1 self-start rounded-[20px] bg-surface px-4 py-3 shadow-soft" aria-label="Alivora is thinking">
                {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-pulse rounded-full bg-secondary" style={{ animationDelay: `${i * 150}ms` }} />)}
              </p>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="sticky bottom-24 flex items-center gap-2 rounded-full border border-border bg-surface p-1.5 pl-4 shadow-soft"
          >
            <label htmlFor="ai-input" className="sr-only">Ask Alivora</label>
            <input
              id="ai-input"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Alivora anything…"
              className="min-h-10 flex-1 bg-transparent text-body focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || thinking}
              className={cn("inline-flex size-10 items-center justify-center rounded-full transition-colors", input.trim() ? "bg-primary text-white" : "bg-border text-text-secondary")}
            >
              <ArrowUp className="size-5" />
            </button>
          </form>
        </>
      )}
    </Screen>
  );
}
