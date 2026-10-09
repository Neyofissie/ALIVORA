import { cn } from "@/lib/cn";

/** Wordmark: lowercase "alivora" in Playfair Display with a Muted Rose full stop. */
export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <span
      className={cn("font-display font-semibold tracking-tight", inverse ? "text-white" : "text-primary", className)}
      aria-label="alivora"
    >
      alivora<span className="text-accent">.</span>
    </span>
  );
}

export function AppIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-16 items-center justify-center rounded-[18px] bg-background font-display text-[40px] font-semibold text-primary shadow-soft",
        className,
      )}
      aria-label="alivora app icon"
    >
      a<span className="text-accent">.</span>
    </span>
  );
}
