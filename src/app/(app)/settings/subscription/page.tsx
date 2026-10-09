"use client";

import { useState } from "react";
import { Check, Crown } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { Alert, ScreenSkeleton } from "@/components/ui/Feedback";
import { PLANS } from "@/lib/plans";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

export default function SubscriptionPage() {
  const { ready, state, dispatch, toast } = useStore();
  const [pending, setPending] = useState<string | null>(null);
  const current = state.household.plan;

  return (
    <Screen>
      <SubHeader title="Plans" />
      {!ready ? (
        <ScreenSkeleton />
      ) : (
        <div className="flex flex-col gap-4">
          <Alert tone="info" title="Demo billing" body="Stripe Checkout is connected in a later sprint. Choosing a plan here only changes the demo." />
          {Object.values(PLANS).map((p) => {
            const isCurrent = p.id === current;
            return (
              <section key={p.id} className={cn("rounded-card p-5", p.id === "ai" ? "bg-primary text-white" : "bg-surface shadow-soft", isCurrent && "ring-2 ring-secondary")}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-h3 font-semibold">
                      {p.id !== "free" && <Crown className="size-5 text-warning" fill="currentColor" fillOpacity={0.3} aria-hidden />}
                      {p.name}
                    </h2>
                    <p className={cn("text-body", p.id === "ai" ? "text-white/80" : "text-text-secondary")}>{p.priceLabel}</p>
                  </div>
                  {isCurrent && <span className="rounded-full bg-secondary px-3 py-1 text-caption font-semibold text-primary">Current</span>}
                </div>
                <ul className="mt-4 flex flex-col gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-body">
                      <Check className={cn("size-4", p.id === "ai" ? "text-secondary" : "text-success")} aria-hidden /> {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <Button
                    block
                    className="mt-5"
                    variant={p.id === "ai" ? "secondary" : p.id === "free" ? "tertiary" : "primary"}
                    loading={pending === p.id}
                    onClick={() => {
                      setPending(p.id);
                      setTimeout(() => {
                        dispatch({ type: "updateHousehold", patch: { plan: p.id } });
                        setPending(null);
                        toast({ tone: "success", title: p.id === "free" ? "Moved to Alivora Free" : `Welcome to ${p.name}`, body: "Your household records are unchanged." });
                      }, 700);
                    }}
                  >
                    {p.id === "free" ? "Downgrade to Free" : `Choose ${p.name}`}
                  </Button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </Screen>
  );
}
