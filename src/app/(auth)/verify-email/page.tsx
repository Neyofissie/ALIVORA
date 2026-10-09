"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";

function VerifyEmail() {
  const email = useSearchParams().get("email") ?? "your email";
  const [resent, setResent] = useState(false);
  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-secondary-soft text-primary">
        <MailCheck className="size-8" strokeWidth={1.75} />
      </span>
      <h1 className="mt-6 text-h2 font-semibold">Check your inbox</h1>
      <p className="mt-2 max-w-xs text-body text-text-secondary">
        We sent a verification link to <span className="font-semibold text-text-primary">{email}</span>. Verify your
        email to access your household.
      </p>
      {resent && <Alert tone="success" title="Email sent" body="A new link is on its way." className="mt-6 w-full text-left" />}
      <div className="mt-auto flex w-full flex-col gap-3 pt-8">
        <LinkButton href="/onboarding" block>I&apos;ve verified my email</LinkButton>
        <Button variant="tertiary" block onClick={() => setResent(true)}>Resend email</Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
