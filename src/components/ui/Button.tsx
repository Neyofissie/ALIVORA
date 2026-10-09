import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "tertiary" | "destructive" | "ghost";
type Size = "md" | "sm";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-button font-semibold text-body transition-[background-color,transform,box-shadow] duration-[var(--motion-button)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-100";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-[#2a2340] active:bg-[#221c35] disabled:bg-border disabled:text-text-secondary",
  secondary: "bg-secondary text-primary hover:bg-[#ab98d4] disabled:bg-border disabled:text-text-secondary",
  tertiary:
    "border border-border bg-surface text-text-primary hover:bg-primary-soft disabled:text-text-secondary",
  destructive: "bg-error-soft text-error hover:bg-[#f6dcdf] disabled:text-text-secondary",
  ghost: "text-primary hover:bg-primary-soft",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-5",
  sm: "min-h-11 px-4",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  block,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {children}
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  block,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], block && "w-full", className)}>
      {children}
    </Link>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-full text-text-primary transition-colors duration-[var(--motion-button)] hover:bg-primary-soft",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
