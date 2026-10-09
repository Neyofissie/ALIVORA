"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, CircleHelp, CreditCard, House, LogOut, Palette, RotateCcw, Shield, User } from "lucide-react";
import { SubHeader } from "@/components/layout/TopBar";
import { Screen } from "@/components/layout/Screen";
import { Avatar } from "@/components/ui/Avatar";
import { PLANS } from "@/lib/plans";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  const { state, currentUser, resetDemo, toast } = useStore();
  const rows = [
    { href: "/settings/account", icon: User, label: "Account" },
    { href: "/family", icon: User, label: "Family members" },
    { href: "/settings/household", icon: House, label: "Household" },
    { href: "/settings/notifications", icon: Bell, label: "Notifications" },
    { href: "/settings/subscription", icon: CreditCard, label: "Subscription", value: PLANS[state.household.plan].name },
    { href: "/settings/privacy", icon: Shield, label: "Privacy & data" },
    { href: "/settings/help", icon: CircleHelp, label: "Help & support" },
    { href: "/design-system", icon: Palette, label: "Design system" },
  ];
  return (
    <Screen>
      <SubHeader title="Settings" />
      <div className="mb-6 flex items-center gap-4 rounded-card bg-surface p-4 shadow-soft">
        <Avatar member={currentUser} size="lg" />
        <div className="min-w-0">
          <p className="text-body-lg font-semibold">{currentUser.name}</p>
          <p className="truncate text-body text-text-secondary">{currentUser.email}</p>
        </div>
      </div>
      <ul className="divide-y divide-border rounded-card bg-surface shadow-soft">
        {rows.map(({ href, icon: Icon, label, value }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-14 items-center gap-3 px-4">
              <Icon className="size-5 text-text-secondary" strokeWidth={1.75} aria-hidden />
              <span className="flex-1 text-body">{label}</span>
              {value && <span className="text-caption text-text-secondary">{value}</span>}
              <ChevronRight className="size-4 text-text-secondary" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-4 divide-y divide-border rounded-card bg-surface shadow-soft">
        <li>
          <button
            className="flex min-h-14 w-full items-center gap-3 px-4 text-left"
            onClick={() => {
              resetDemo();
              toast({ tone: "info", title: "Demo data reset" });
              router.push("/home");
            }}
          >
            <RotateCcw className="size-5 text-text-secondary" strokeWidth={1.75} aria-hidden />
            <span className="flex-1 text-body">Reset demo data</span>
          </button>
        </li>
        <li>
          <Link href="/" className="flex min-h-14 items-center gap-3 px-4 text-error">
            <LogOut className="size-5" strokeWidth={1.75} aria-hidden />
            <span className="flex-1 text-body font-medium">Log out</span>
          </Link>
        </li>
      </ul>
    </Screen>
  );
}
