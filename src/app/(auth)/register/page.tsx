"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Controls";
import { Field, Input } from "@/components/ui/Field";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(10, "Use at least 10 characters"),
  terms: z.literal(true, { message: "Please accept the terms to continue" }),
});

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    // Supabase Auth sign-up lands in Sprint 1; the demo continues to verification.
    setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(result.data.email)}`), 500);
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
      <div className="mb-2">
        <h1 className="text-h2 font-semibold">Create your account</h1>
        <p className="text-body text-text-secondary">Start organising family life together.</p>
      </div>
      <Field label="Your name" error={errors.name}>
        {(p) => <Input {...p} icon={<User className="size-4" />} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Emma Williams" />}
      </Field>
      <Field label="Email" error={errors.email}>
        {(p) => <Input {...p} icon={<Mail className="size-4" />} type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" />}
      </Field>
      <Field label="Password" error={errors.password} hint="At least 10 characters.">
        {(p) => <Input {...p} icon={<Lock className="size-4" />} type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />}
      </Field>
      <div>
        <Checkbox checked={form.terms} onChange={(v) => setForm({ ...form, terms: v })} label="I agree to the terms and privacy notice" />
        {errors.terms && <p className="text-caption font-medium text-error" role="alert">{errors.terms}</p>}
      </div>
      <div className="mt-auto flex flex-col gap-3 pt-4">
        <Button type="submit" block loading={loading}>Create account</Button>
        <p className="text-center text-body text-text-secondary">
          Already have an account? <Link href="/login" className="font-semibold text-primary">Sign in</Link>
        </p>
      </div>
    </form>
  );
}
