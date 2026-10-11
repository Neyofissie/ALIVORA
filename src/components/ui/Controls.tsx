"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-[var(--motion-card)] disabled:opacity-50",
        checked ? "bg-secondary" : "bg-border",
      )}
    >
      <span
        className={cn(
          "inline-block size-6 rounded-full bg-surface shadow-soft transition-transform duration-[var(--motion-card)]",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  hideLabel,
  round,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hideLabel?: boolean;
  round?: boolean;
}) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={cn(
          "flex size-6 shrink-0 items-center justify-center border-2 transition-colors duration-[var(--motion-button)] peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
          round ? "rounded-full" : "rounded-md",
          checked ? "border-success bg-success text-white" : "border-border-strong bg-surface",
        )}
      >
        {checked && <Check className="animate-check size-4" strokeWidth={3} />}
      </span>
      <span className={cn("text-body text-text-primary", hideLabel && "sr-only")}>{label}</span>
    </label>
  );
}

export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  className,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string; description?: string }>;
  className?: string;
}) {
  return (
    <div role="radiogroup" className={cn("flex flex-col gap-2", className)}>
      {options.map((o) => (
        <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="radio"
            className="peer sr-only"
            name={name}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span
            aria-hidden
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
              value === o.value ? "border-primary" : "border-border-strong",
            )}
          >
            {value === o.value && <span className="size-3 rounded-full bg-primary" />}
          </span>
          <span className="flex flex-col">
            <span className="text-body text-text-primary">{o.label}</span>
            {o.description && <span className="text-caption text-text-secondary">{o.description}</span>}
          </span>
        </label>
      ))}
    </div>
  );
}

export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-full bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-10 flex-1 rounded-full px-3 text-body font-medium transition-colors duration-[var(--motion-card)]",
            value === o.value ? "bg-secondary text-primary shadow-soft" : "text-text-secondary hover:text-text-primary",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-full border px-4 text-body transition-colors duration-[var(--motion-button)]",
        selected ? "border-primary bg-primary text-white" : "border-border bg-surface text-text-primary hover:bg-primary-soft",
      )}
    >
      {children}
    </button>
  );
}
