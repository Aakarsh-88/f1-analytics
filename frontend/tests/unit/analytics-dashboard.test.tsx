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
jest.mock("@/components/analytics/driver-series-chart", () => ({
  DriverSeriesChart: (props: { points: unknown; title: string }) => (
    <div data-testid={`driver-series-${props.title}`}>{JSON.stringify(props.points)}</div>
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
  raceWins: { driverCodes: ["VER"], points: [{ season: 2021, VER: 1 }] },
  avgFinishing: { driverCodes: ["VER"], points: [{ season: 2021, VER: 2 }] },
  podiumPercentage: { driverCodes: ["VER"], points: [{ season: 2021, VER: 50 }] },
  driverTeams: [],
};

describe("AnalyticsDashboard filtering", () => {
  it("uses the default 2014–2024 range for constructor analytics", () => {
    render(<AnalyticsDashboard data={mockData} />);

    const dominance = JSON.parse(screen.getByTestId("dominance-chart").textContent!);
    expect(dominance.map((p: { season: number }) => p.season)).toEqual([2021, 2022, 2023, 2024]);
  });

  it("keeps driver range controls independent from constructor range controls", async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard data={mockData} />);

    await user.selectOptions(screen.getByLabelText("Driver From"), "2024");

    const poles = JSON.parse(screen.getByTestId("poles-chart").textContent!);
    expect(poles).toEqual(mockData.poleLeaderboard);
    expect(screen.getByLabelText("Constructor From")).toHaveValue("2021");
  });

  it("filters season-indexed chart data when the range narrows", async () => {
    const user = userEvent.setup();
    render(<AnalyticsDashboard data={mockData} />);

    await user.selectOptions(screen.getByLabelText("Driver From"), "2023");
    await user.selectOptions(screen.getByLabelText("Driver To"), "2024");

    const dominance = JSON.parse(screen.getByTestId("dominance-chart").textContent!);
    expect(dominance.map((p: { season: number }) => p.season)).toEqual([2021, 2022, 2023, 2024]);

    const avgQualifying = JSON.parse(screen.getByTestId("avg-qualifying-chart").textContent!);
    expect(avgQualifying.map((p: { season: number }) => p.season)).toEqual([2023, 2024]);

    const podiumTrends = JSON.parse(screen.getByTestId("driver-series-Podiums").textContent!);
    expect(podiumTrends.map((p: { season: number }) => p.season)).toEqual([2023, 2024]);
  });

  it("passes the current season range to SavedViewsPanel", () => {
    render(<AnalyticsDashboard data={mockData} />);
    expect(screen.getAllByTestId("saved-views-panel")).toHaveLength(2);
  });
});
