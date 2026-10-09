import { cn } from "@/lib/cn";

/** Mobile page column: 390px reference, 20px gutters, never narrower than 320px. */
export function Screen({ children, className }: { children: React.ReactNode; className?: string }) {
  return <main className={cn("mx-auto w-full max-w-[480px] px-5", className)}>{children}</main>;
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-body-lg font-semibold">{title}</h2>
      {action}
    </div>
  );
}
