import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { SectorStrip } from "./sector-strip";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Omit the sector strip for cards nested inside another card (avoids visual noise stacking up). */
  showStrip?: boolean;
  stripState?: "idle" | "loading";
}

export function Card({
  className,
  showStrip = true,
  stripState = "idle",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-[rgb(var(--surface-card))]",
        "shadow-sm transition-shadow hover:shadow-md",
        className
      )}
      {...props}
    >
      {showStrip && <SectorStrip state={stripState} />}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-sm font-semibold uppercase tracking-wider text-[rgb(var(--text-secondary))]", className)}
      {...props}
    />
  );
}
