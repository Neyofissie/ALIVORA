"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Field";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <form
      noValidate
      className="flex flex-1 flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address");
        setError(undefined);
        setSent(true);
      }}
    >
      <div className="mb-2">
        <h1 className="text-h2 font-semibold">Reset your password</h1>
        <p className="text-body text-text-secondary">We&apos;ll email you a secure, single-use link.</p>
      </div>
      <Field label="Email" error={error}>
        {(p) => <Input {...p} icon={<Mail className="size-4" />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />}
      </Field>
      {/* Same message whether or not the account exists, to avoid account enumeration. */}
      {sent && <Alert tone="success" title="Check your email" body="If an account exists for that address, a reset link is on its way." />}
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <Button type="submit" block>Send reset link</Button>
        <LinkButton href="/login" variant="tertiary" block>Back to sign in</LinkButton>
      </div>
    </form>
  );
}
