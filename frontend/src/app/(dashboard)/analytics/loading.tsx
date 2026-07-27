import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CardSkeleton />
        </div>
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
