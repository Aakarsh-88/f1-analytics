"use client";

import { cn } from "@/lib/utils";
import { getTeamBorderClass, getTeamTextClass } from "@/lib/team-colors";

export interface PodiumFinisher {
  position: 1 | 2 | 3;
  driverName: string;
  constructorName: string;
  constructorRef: string;
  points: number;
}

const POSITION_LABEL: Record<number, string> = { 1: "P1", 2: "P2", 3: "P3" };

/**
 * Podium cards for the top 3 finishers of a race. Left border takes the
 * constructor's real team color. On hover, a diagonal light sweep plays
 * across the card — a restrained nod to a glossy livery catching light,
 * not a generic shimmer effect (it only fires on hover, once, not as
 * ambient looping motion).
 */
export function PodiumCard({ finisher }: { finisher: PodiumFinisher }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border-l-4 border-y border-r border-line bg-[rgb(var(--surface-card))] p-4",
        "transition-transform hover:-translate-y-0.5 hover:shadow-lg",
        getTeamBorderClass(finisher.constructorRef)
      )}
    >
      {/* Hover shine sweep */}
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between">
        <span className="font-display text-2xl font-bold text-[rgb(var(--text-primary))]">
          {POSITION_LABEL[finisher.position]}
        </span>
        <span className="font-mono text-sm tabular-nums text-[rgb(var(--text-secondary))]">
          {finisher.points} pts
        </span>
      </div>

      <p className="relative mt-2 font-display text-lg font-semibold text-[rgb(var(--text-primary))]">
        {finisher.driverName}
      </p>
      <p className={cn("relative text-sm font-medium", getTeamTextClass(finisher.constructorRef))}>
        {finisher.constructorName}
      </p>
    </div>
  );
}
