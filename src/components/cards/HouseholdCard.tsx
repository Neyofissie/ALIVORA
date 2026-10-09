import Link from "next/link";
import { ChevronRight, Crown, House } from "lucide-react";
import type { Member } from "@/lib/domain/types";
import { AvatarGroup } from "@/components/ui/Avatar";
import { LinkButton } from "@/components/ui/Button";

export function HouseholdCard({ name, taskCount, members }: { name: string; taskCount: number; members: Member[] }) {
  return (
    <Link href="/settings/household" className="flex items-center gap-4 rounded-card bg-surface p-4 shadow-soft">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary-soft text-primary">
        <House className="size-6" strokeWidth={1.75} fill="currentColor" fillOpacity={0.15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-lg font-semibold">{name}</span>
        <span className="block text-caption text-text-secondary">
          {taskCount} tasks · {members.length} members
        </span>
      </span>
      <AvatarGroup members={members} max={3} size="xs" />
      <ChevronRight className="size-5 text-text-secondary" aria-hidden />
    </Link>
  );
}

export function SubscriptionCard({ planName }: { planName: string }) {
  return (
    <div className="rounded-card bg-[#f1ece6] p-5">
      <p className="flex items-center gap-2 text-body-lg font-semibold">
        <Crown className="size-5 text-warning" strokeWidth={1.75} fill="currentColor" fillOpacity={0.3} aria-hidden />
        Alivora Plus
      </p>
      <p className="mt-1 text-body text-text-secondary">
        Unlock more members, unlimited planning and AI suggestions. You&apos;re on {planName}.
      </p>
      <LinkButton href="/settings/subscription" block className="mt-4">
        Upgrade
      </LinkButton>
    </div>
  );
}
