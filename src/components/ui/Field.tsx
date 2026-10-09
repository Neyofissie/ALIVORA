import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const control =
  "w-full min-h-12 rounded-input border border-border bg-surface px-4 text-body text-text-primary placeholder:text-text-secondary/70 transition-colors focus:border-primary focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-secondary/40 aria-[invalid=true]:border-error";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-medium text-text-secondary">
        {label}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": error || hint ? msgId : undefined })}
      {error ? (
        <p id={msgId} className="text-caption font-medium text-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={msgId} className="text-caption text-text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  icon,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
  if (!icon) return <input className={cn(control, className)} {...rest} />;
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-text-secondary">{icon}</span>
      <input className={cn(control, "pl-11", className)} {...rest} />
    </div>
  );
}

export function Textarea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(control, "min-h-24 py-3", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={cn(control, "appearance-none pr-10", className)} {...rest}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-text-secondary"
        aria-hidden
      />
    </div>
  );
}
