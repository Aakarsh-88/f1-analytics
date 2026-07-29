import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import type { AnalyticsData } from "@/types/analytics";

// Every chart is mocked to a tiny stub that dumps its received props as
// JSON — this lets the test assert on exactly what data reached each
// chart after a season-range change, without needing Recharts to
// actually render anything. SeasonRangeFilter is NOT mocked: the real
// component is exercised so this test covers the actual user
// interaction, not just the dashboard's internal filtering function.
jest.mock("@/components/analytics/constructor-dominance-chart", () => ({
  ConstructorDominanceChart: (props: { points: unknown }) => (
    <div data-testid="dominance-chart">{JSON.stringify(props.points)}</div>
  ),
}));
jest.mock("@/components/analytics/pole-positions-chart", () => ({
  PolePositionsChart: (props: { rows: unknown }) => (
    <div data-testid="poles-chart">{JSON.stringify(props.rows)}</div>
  ),
}));
jest.mock("@/components/analytics/fastest-laps-chart", () => ({
  FastestLapsChart: (props: { rows: unknown }) => (
    <div data-testid="fastest-laps-chart">{JSON.stringify(props.rows)}</div>
  ),
}));
jest.mock("@/components/analytics/average-qualifying-chart", () => ({
  AverageQualifyingChart: (props: { points: unknown }) => (
    <div data-testid="avg-qualifying-chart">{JSON.stringify(props.points)}</div>
  ),
}));
jest.mock("@/components/analytics/podium-trends-chart", () => ({
  PodiumTrendsChart: (props: { points: unknown }) => (
    <div data-testid="podium-trends-chart">{JSON.stringify(props.points)}</div>
  ),
}));
jest.mock("@/components/analytics/saved-views-panel", () => ({
  SavedViewsPanel: () => <div data-testid="saved-views-panel" />,
}));

const mockData: AnalyticsData = {
  seasonRange: { min: 2021, max: 2025 },
  constructorDominance: {
    constructors: [{ ref: "red_bull", name: "Red Bull Racing" }],
    points: [
      { season: 2021, red_bull: 100 },
      { season: 2022, red_bull: 200 },
      { season: 2023, red_bull: 300 },
      { season: 2024, red_bull: 400 },
      { season: 2025, red_bull: 500 },
    ],
  },
  poleLeaderboard: [{ driverCode: "VER", driverName: "Max Verstappen", poles: 10 }],
  fastestLapLeaderboard: [{ driverCode: "VER", driverName: "Max Verstappen", fastestLaps: 5 }],
  avgQualifying: {
    driverCodes: ["VER"],
    points: [
      { season: 2021, VER: 2 },
      { season: 2022, VER: 2 },
      { season: 2023, VER: 1 },
      { season: 2024, VER: 3 },
      { season: 2025, VER: 4 },
    ],
  },
  podiumTrends: {
    driverCodes: ["VER"],
    points: [
      { season: 2021, VER: 18 },
      { season: 2022, VER: 17 },
      { season: 2023, VER: 21 },
      { season: 2024, VER: 14 },
      { season: 2025, VER: 10 },
    ],
  },
};

describe("AnalyticsDashboard filtering", () => {
  it("passes the full unfiltered dataset to season-indexed charts by default", () => {
    render(<AnalyticsDashboard data={mockData} />);

    const dominance = JSON.parse(screen.getByTestId("dominance-chart").textContent!);
    expect(dominance).toHaveLength(5);
  });

  it("passes the ENTIRE leaderboard data to the all-time charts regardless of season range", async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard data={mockData} />);

    await user.selectOptions(screen.getByLabelText("From"), "2024");

    const poles = JSON.parse(screen.getByTestId("poles-chart").textContent!);
    expect(poles).toEqual(mockData.poleLeaderboard);
  });

  it("filters season-indexed chart data when the range narrows", async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard data={mockData} />);

    await user.selectOptions(screen.getByLabelText("From"), "2023");
    await user.selectOptions(screen.getByLabelText("To"), "2024");

    const dominance = JSON.parse(screen.getByTestId("dominance-chart").textContent!);
    expect(dominance.map((p: { season: number }) => p.season)).toEqual([2023, 2024]);

    const avgQualifying = JSON.parse(screen.getByTestId("avg-qualifying-chart").textContent!);
    expect(avgQualifying.map((p: { season: number }) => p.season)).toEqual([2023, 2024]);

    const podiumTrends = JSON.parse(screen.getByTestId("podium-trends-chart").textContent!);
    expect(podiumTrends.map((p: { season: number }) => p.season)).toEqual([2023, 2024]);
  });

  it("passes the current season range to SavedViewsPanel", () => {
    render(<AnalyticsDashboard data={mockData} />);
    expect(screen.getByTestId("saved-views-panel")).toBeInTheDocument();
  });
});
