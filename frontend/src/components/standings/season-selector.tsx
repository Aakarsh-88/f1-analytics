"use client";

interface SeasonSelectorProps {
  season: number;
  seasons: number[];
}

export function SeasonSelector({ season, seasons }: SeasonSelectorProps) {
  return (
    <label className="w-full sm:w-40">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[rgb(var(--text-secondary))]">
        Season
      </span>
      <select
        name="season"
        value={season}
        onChange={(event) => {
          window.location.href = `/standings?season=${event.target.value}`;
        }}
        className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
      >
        {seasons.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </label>
  );
}
