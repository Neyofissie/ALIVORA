"use client";

import { AlertTriangle, CheckCircle2, CircleAlert, RefreshCw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStore, type Toast } from "@/lib/store";
import { Button } from "./Button";

const tones = {
  success: { box: "bg-success-soft", icon: CheckCircle2, iconClass: "text-success" },
  info: { box: "bg-secondary-soft", icon: Sparkles, iconClass: "text-primary" },
  warning: { box: "bg-warning-soft", icon: AlertTriangle, iconClass: "text-warning" },
  error: { box: "bg-error-soft", icon: CircleAlert, iconClass: "text-error" },
} as const;

export function Alert({
  tone,
  title,
  body,
  onDismiss,
  className,
}: {
  tone: Toast["tone"];
  title: string;
  body?: string;
  onDismiss?: () => void;
  className?: string;
}) {
  const t = tones[tone];
  const Icon = t.icon;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-input p-3.5", t.box, className)}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", t.iconClass)} strokeWidth={1.75} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-text-primary">{title}</p>
        {body && <p className="text-caption text-text-secondary">{body}</p>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-2 inline-flex size-9 items-center justify-center rounded-full text-text-secondary hover:bg-black/5"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-50 mx-auto flex max-w-[440px] flex-col gap-2 px-4"
    >
      {toasts.map((t) => (
        <div key={t.id} className="animate-fade-up pointer-events-auto shadow-soft">
          <Alert tone={t.tone} title={t.title} body={t.body} onDismiss={() => dismissToast(t.id)} />
        </div>
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-input bg-[#ebe8ee]", className)} />;
}

export function ScreenSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-40 w-full rounded-feature" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
      <Skeleton className="h-16 w-full rounded-card" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border bg-surface/60 px-6 py-8 text-center">
      <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-secondary-soft text-primary">
        <Icon className="size-6" strokeWidth={1.75} />
      </span>
      <p className="text-body-lg font-semibold text-text-primary">{title}</p>
      <p className="max-w-xs text-body text-text-secondary">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-error-soft px-6 py-8 text-center" role="alert">
      <CircleAlert className="size-7 text-error" strokeWidth={1.75} />
      <p className="text-body-lg font-semibold">{title}</p>
      <p className="text-body text-text-secondary">{body}</p>
      <Button variant="tertiary" size="sm" onClick={onRetry} className="mt-2">
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-[#ebe8ee]"
    >
      <div className="h-full rounded-full bg-success transition-[width] duration-[var(--motion-card)]" style={{ width: `${pct}%` }} />
    </div>
  );
}
