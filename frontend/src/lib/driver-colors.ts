/**
 * Shared by the analytics charts introduced in this milestone
 * (average-qualifying-chart, podium-trends-chart) so they don't each
 * duplicate their own copy. Note: `lap-time-chart.tsx` and
 * `progression-chart.tsx` (Milestone 5) keep their own local copies of
 * this same mapping rather than being refactored to import from here —
 * intentional, to avoid touching already-shipped/verified files without
 * a functional reason to.
 */
export const DRIVER_LINE_COLORS: Record<string, string> = {
  VER: "#3671C6",
  NOR: "#FF8000",
  LEC: "#E8002D",
};

export const DEFAULT_DRIVER_LINE_COLOR = "#9B5DE5";
