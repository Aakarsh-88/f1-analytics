const FALLBACK_COMPARISON_COLORS = [
  "#9B5DE5",
  "#00B4D8",
  "#F15BB5",
  "#FEE440",
  "#00F5D4",
  "#FB5607",
  "#8338EC",
  "#3A86FF",
];

export function getDistinctComparisonColors(
  keys: string[],
  preferredColors: Record<string, string | undefined>
): Record<string, string> {
  const assigned = new Map<string, string>();
  const used = new Set<string>();

  for (const key of keys) {
    const preferred = preferredColors[key];
    if (preferred && !used.has(preferred)) {
      assigned.set(key, preferred);
      used.add(preferred);
      continue;
    }

    const fallback = FALLBACK_COMPARISON_COLORS.find((color) => !used.has(color));
    const color =
      fallback ??
      FALLBACK_COMPARISON_COLORS[assigned.size % FALLBACK_COMPARISON_COLORS.length] ??
      "#FFFFFF";
    assigned.set(key, color);
    used.add(color);
  }

  return Object.fromEntries(assigned);
}
