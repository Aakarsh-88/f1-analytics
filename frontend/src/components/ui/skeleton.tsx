import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[rgb(var(--surface-elevated))]",
        className
      )}
    />
  );
}

/** Full skeleton for a Card-shaped loading state, topped with the animated sector strip. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-[rgb(var(--surface-card))]">
      <div className="sector-strip sector-strip-loading">
        <span />
        <span />
        <span />
      </div>
      <div className="space-y-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  );
}
