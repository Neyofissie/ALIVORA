"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CalendarPlus, House, ListPlus, Plus, Sparkles, SquareCheckBig, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { BottomSheet } from "@/components/ui/Sheet";

/** Five primary destinations (PRD §7) with a central quick-create action. */
const LEFT = [
  { href: "/home", label: "Home", icon: House },
  { href: "/planner", label: "Planner", icon: CalendarDays },
];
const RIGHT = [
  { href: "/tasks", label: "Tasks", icon: SquareCheckBig },
  { href: "/ai", label: "AI", icon: Sparkles },
  { href: "/family", label: "Family", icon: Users },
];

function NavLink({ href, label, icon: Icon }: (typeof LEFT)[number]) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-text-secondary hover:text-text-primary",
      )}
    >
      <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} fill={active && href === "/home" ? "currentColor" : "none"} />
      {label}
    </Link>
  );
}

export function BottomNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav
        aria-label="Primary"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-[480px] items-center px-2">
          {LEFT.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
          <div className="flex flex-1 justify-center">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Create"
              className="-mt-6 inline-flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_6px_20px_rgb(53_44_79/0.35)] transition-transform active:scale-95"
            >
              <Plus className="size-7" strokeWidth={2} />
            </button>
          </div>
          {RIGHT.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </div>
      </nav>
      <BottomSheet open={open} onOpenChange={setOpen} title="Create" description="What would you like to add?">
        <div className="grid gap-2">
          {[
            { href: "/planner/new", icon: CalendarPlus, label: "Add event", body: "Appointments, activities and plans" },
            { href: "/tasks/new", icon: ListPlus, label: "Add task", body: "Assign a responsibility" },
            { href: "/ai", icon: Sparkles, label: "Ask Alivora", body: "Describe it in your own words" },
          ].map(({ href, icon: Icon, label, body }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-16 items-center gap-4 rounded-card border border-border px-4 hover:bg-primary-soft"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary-soft text-primary">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <span>
                <span className="block text-body font-semibold">{label}</span>
                <span className="block text-caption text-text-secondary">{body}</span>
              </span>
            </Link>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
