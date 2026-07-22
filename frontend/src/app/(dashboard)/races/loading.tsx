import { Skeleton } from "@/components/ui/skeleton";

export default function RacesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-56 animate-pulse rounded-md bg-[rgb(var(--surface-elevated))]" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-[rgb(var(--surface-elevated))]" />
      </div>
      <Skeleton className="h-10 w-full max-w-sm" />
      <div className="overflow-hidden rounded-lg border border-line">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-line p-4 last:border-b-0">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
