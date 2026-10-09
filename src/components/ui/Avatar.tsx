import type { Member } from "@/lib/domain/types";
import { cn } from "@/lib/cn";

const sizes = { xs: "size-7 text-[11px]", sm: "size-8 text-caption", md: "size-10 text-body", lg: "size-14 text-body-lg" };

export function Avatar({
  member,
  size = "md",
  ring,
  className,
}: {
  member: Pick<Member, "name" | "colour">;
  size?: keyof typeof sizes;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={member.name}
      title={member.name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-primary",
        sizes[size],
        ring && "ring-2 ring-surface",
        className,
      )}
      style={{ backgroundColor: `color-mix(in srgb, ${member.colour} 45%, white)` }}
    >
      {member.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function AvatarGroup({
  members,
  max = 3,
  size = "sm",
}: {
  members: Array<Pick<Member, "id" | "name" | "colour">>;
  max?: number;
  size?: keyof typeof sizes;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <span className="flex items-center -space-x-2" aria-label={members.map((m) => m.name).join(", ")}>
      {shown.map((m) => (
        <Avatar key={m.id} member={m} size={size} ring />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-[#efecf1] font-medium text-text-secondary ring-2 ring-surface",
            sizes[size],
          )}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
