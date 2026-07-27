import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getAnalyticsData } from "@/lib/api/analytics";

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
          Constructor dominance, qualifying pace, and podium trends across seasons.
        </p>
      </div>

      <AnalyticsDashboard data={data} />
    </div>
  );
}
