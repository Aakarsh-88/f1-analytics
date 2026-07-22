import { cn } from "@/lib/utils";

type TireCompound = "soft" | "medium" | "hard" | "intermediate" | "wet";

const COMPOUND_LABEL: Record<TireCompound, string> = {
  soft: "S",
  medium: "M",
  hard: "H",
  intermediate: "I",
  wet: "W",
};

/**
 * Renders a tire compound as the actual colored-ring symbol used on F1
 * broadcast graphics (soft=red, medium=yellow, hard=white outline,
 * intermediate=green, wet=blue) — real motorsport vocabulary, not an
 * invented color code.
 */
export function TireBadge({ compound, className }: { compound: TireCompound; className?: string }) {
  return (
    <span
      title={compound}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full border-2 font-display text-[10px] font-bold",
        compound === "soft" && "border-tire-soft text-tire-soft",
        compound === "medium" && "border-tire-medium text-tire-medium",
        compound === "hard" && "border-tire-hard text-[rgb(var(--text-primary))]",
        compound === "intermediate" && "border-tire-intermediate text-tire-intermediate",
        compound === "wet" && "border-tire-wet text-tire-wet",
        className
      )}
    >
      {COMPOUND_LABEL[compound]}
    </span>
  );
}
