import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "success" | "danger";
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variant === "neutral" && "bg-[rgb(var(--surface-elevated))] text-[rgb(var(--text-secondary))]",
        variant === "success" && "bg-sector-green/10 text-sector-green",
        variant === "danger" && "bg-f1-red/10 text-f1-red",
        className
      )}
      {...props}
    />
  );
}
