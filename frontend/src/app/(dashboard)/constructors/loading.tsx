import { CardSkeleton } from "@/components/ui/skeleton";

export default function ConstructorsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-md bg-[rgb(var(--surface-elevated))]" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-[rgb(var(--surface-elevated))]" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
