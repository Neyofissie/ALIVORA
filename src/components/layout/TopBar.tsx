"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/Button";

/** Header for top-level tabs: title on the left, notifications + profile on the right. */
export function TabHeader({ title, action }: { title: React.ReactNode; action?: React.ReactNode }) {
  const { state, currentUser, ready } = useStore();
  const unread = ready ? state.notifications.filter((n) => !n.read).length : 0;
  return (
    <header className="flex items-center justify-between gap-3 pt-2 pb-4">
      <div className="min-w-0">{title}</div>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        <Link
          href="/notifications"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="relative inline-flex size-11 items-center justify-center rounded-full hover:bg-primary-soft"
        >
          <Bell className="size-[22px]" strokeWidth={1.75} />
          {unread > 0 && <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-accent ring-2 ring-background" />}
        </Link>
        <Link href="/settings" aria-label="Account and settings" className="inline-flex size-11 items-center justify-center">
          <Avatar member={currentUser} size="sm" />
        </Link>
      </div>
    </header>
  );
}

/** Header for detail/sub screens: back button, centred title, optional action. */
export function SubHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="grid grid-cols-[44px_1fr_44px] items-center pt-2 pb-4">
      <IconButton
        label="Back"
        className="-ml-2"
        onClick={() => (backHref ? router.push(backHref) : router.back())}
      >
        <ChevronLeft className="size-6" strokeWidth={1.75} />
      </IconButton>
      <h1 className="truncate text-center text-body-lg font-semibold">{title}</h1>
      <div className="flex justify-end">{action}</div>
    </header>
  );
}
