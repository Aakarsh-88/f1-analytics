import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function StandingsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
