import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5 pt-10 pb-8">
      <Link href="/" className="mx-auto mb-10">
        <Logo className="text-[32px]" />
      </Link>
      {children}
    </main>
  );
}
