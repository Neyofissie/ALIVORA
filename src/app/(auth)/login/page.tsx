"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { state, resetDemo } = useStore();
  const [email, setEmail] = useState("emma@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email) || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError(undefined);
    setLoading(true);
    // Demo sign-in: Supabase Auth replaces this in Sprint 1.
    setTimeout(() => {
      if (!state.onboarded) resetDemo();
      router.push("/home");
    }, 400);
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
      <div className="mb-2">
        <h1 className="text-h2 font-semibold">Welcome back</h1>
        <p className="text-body text-text-secondary">Sign in to your family space.</p>
      </div>
      <Field label="Email">
        {(p) => <Input {...p} icon={<Mail className="size-4" />} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
      </Field>
      <Field label="Password" error={error}>
        {(p) => <Input {...p} icon={<Lock className="size-4" />} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Any password works in the demo" />}
      </Field>
      <Link href="/reset-password" className="self-end text-body font-semibold text-primary">Forgot password?</Link>
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <Button type="submit" block loading={loading}>Sign in</Button>
        <p className="text-center text-body text-text-secondary">
          New to Alivora? <Link href="/register" className="font-semibold text-primary">Create an account</Link>
        </p>
      </div>
    </form>
  );
}
