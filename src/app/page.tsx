"use client";

import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { SunsetArch } from "@/components/cards/TomorrowReadyCard";
import { useStore } from "@/lib/store";

export default function WelcomePage() {
  const { ready, state } = useStore();
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 pt-14 pb-8">
      <div className="text-center">
        <Logo className="text-[44px] leading-none" />
        <h1 className="mt-6 font-display text-h1 font-medium text-text-primary">Life, beautifully in sync.</h1>
        <p className="mx-auto mt-3 max-w-xs text-body-lg text-text-secondary">
          Plan. Organise. Share. More time for what matters.
        </p>
      </div>
      <div className="relative mx-auto my-8 flex w-full max-w-xs flex-1 items-end justify-center">
        <SunsetArch className="h-full max-h-80 w-auto" />
      </div>
      <div className="flex flex-col gap-3">
        {ready && state.onboarded ? (
          <LinkButton href="/home" block>
            Open Alivora
          </LinkButton>
        ) : (
          <LinkButton href="/register" block>
            Get started
          </LinkButton>
        )}
        <p className="text-center text-body text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
