import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function RaceDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>
      <CardSkeleton />
    </div>
  );
}
