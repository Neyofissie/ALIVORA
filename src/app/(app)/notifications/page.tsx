"use client";

import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell, BellOff, CalendarDays, CreditCard, SquareCheckBig, Sun, UserPlus } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Button } from "@/components/ui/Button";
import { EmptyState, ScreenSkeleton } from "@/components/ui/Feedback";
import type { NotificationItem } from "@/lib/domain/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/cn";

const ICONS: Record<NotificationItem["kind"], typeof Bell> = {
  task: SquareCheckBig,
  event: CalendarDays,
  briefing: Sun,
  invite: UserPlus,
  billing: CreditCard,
};

export default function NotificationsPage() {
  const { ready, state, dispatch } = useStore();
  const unread = state.notifications.some((n) => !n.read);
  return (
    <Screen>
      <SubHeader
        title="Notifications"
        action={unread ? <Button variant="ghost" size="sm" className="-mr-3 px-2" onClick={() => dispatch({ type: "markNotificationsRead" })}>Read all</Button> : undefined}
      />
      {!ready ? (
        <ScreenSkeleton />
      ) : state.notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications" body="Reminders and updates from your family will appear here." />
      ) : (
        <ul className="flex flex-col gap-2">
          {state.notifications.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <li key={n.id}>
                <Link
                  href={n.href ?? "#"}
                  onClick={() => dispatch({ type: "markNotificationsRead", id: n.id })}
                  className={cn("flex gap-3 rounded-card p-4", n.read ? "bg-surface/60" : "bg-surface shadow-soft")}
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-primary">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-body font-semibold">{n.title}</span>
                      <span className="shrink-0 text-caption text-text-secondary">{formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}</span>
                    </span>
                    <span className="block text-body text-text-secondary">{n.body}</span>
                  </span>
                  {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Screen>
  );
}
