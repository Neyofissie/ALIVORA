import Link from "next/link";
import { useId } from "react";
import { ArrowRight, CalendarDays, Sun } from "lucide-react";

/** Decorative evening landscape in an arch, echoing the brand's warm sunset imagery. */
export function SunsetArch({ className }: { className?: string }) {
  const id = useId();
  const sky = `${id}-sky`;
  const arch = `${id}-arch`;
  return (
    <svg viewBox="0 0 100 130" preserveAspectRatio="xMidYMax meet" className={className} aria-hidden>
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3f6b" />
          <stop offset="0.55" stopColor="#b8a7db" />
          <stop offset="0.85" stopColor="#d7a89a" />
          <stop offset="1" stopColor="#e9c9a8" />
        </linearGradient>
        <clipPath id={arch}>
          <path d="M0 50 A50 50 0 0 1 100 50 V130 H0 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${arch})`}>
        <rect width="100" height="130" fill={`url(#${sky})`} />
        <circle cx="70" cy="34" r="2.4" fill="#f8f6f2" opacity="0.9" />
        <path d="M0 92 L22 74 L38 86 L58 66 L80 84 L100 72 V130 H0 Z" fill="#6b5a86" opacity="0.85" />
        <path d="M0 106 L18 96 L40 104 L62 92 L84 102 L100 96 V130 H0 Z" fill="#3e3459" />
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
          <Sun className="size-6 text-[#f3c98b]" strokeWidth={1.75} aria-hidden />
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
