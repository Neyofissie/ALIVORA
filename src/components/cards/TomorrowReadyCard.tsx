import Link from "next/link";
import { useId } from "react";
import { ArrowRight, CalendarDays, Sun } from "lucide-react";

/**
 * The brand's arch: a lavender sky with a rose sun over rose hills and sage
 * ground, drawn flat from the palette tokens (see the design system cover).
 */
export function SunsetArch({ className }: { className?: string }) {
  const arch = `${useId()}-arch`;
  return (
    <svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden>
      <defs>
        <clipPath id={arch}>
          <path d="M0 50 A50 50 0 0 1 100 50 V130 H0 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${arch})`}>
        <rect width="100" height="130" fill="var(--color-secondary)" />
        <circle cx="64" cy="46" r="13" fill="var(--color-accent)" />
        <path d="M0 92 L22 74 L38 86 L58 66 L80 84 L100 72 V130 H0 Z" fill="var(--color-accent)" opacity="0.9" />
        <path d="M0 106 L18 96 L40 104 L62 92 L84 102 L100 96 V130 H0 Z" fill="var(--color-sage)" />
      </g>
    </svg>
  );
}

export function TomorrowReadyCard({
  headline,
  events,
  tasks,
  href = "/tomorrow",
}: {
  headline: string;
  events: number;
  tasks: number;
  href?: string;
}) {
  return (
    <section
      aria-labelledby="tomorrow-ready-title"
      className="animate-fade-up flex gap-3 overflow-hidden rounded-feature bg-primary p-5 text-white"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 id="tomorrow-ready-title" className="flex items-center gap-2 text-h3 font-semibold whitespace-nowrap">
          <Sun className="size-6 text-accent" strokeWidth={1.75} aria-hidden />
          Tomorrow Ready
        </h2>
        <p className="text-body-lg text-white/85">{headline}</p>
        <p className="flex items-center gap-2 text-body text-white/90">
          <CalendarDays className="size-4" strokeWidth={1.75} aria-hidden />
          {events} {events === 1 ? "event" : "events"} · {tasks} {tasks === 1 ? "task" : "tasks"}
        </p>
        <Link
          href={href}
          className="mt-1 inline-flex min-h-11 w-fit items-center gap-3 rounded-full bg-surface px-5 text-body font-semibold text-primary transition-transform active:scale-[0.98]"
        >
          View tomorrow <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
      </div>
      <SunsetArch className="-my-1 w-[28%] max-w-[120px] shrink-0 self-stretch" />
    </section>
  );
}
