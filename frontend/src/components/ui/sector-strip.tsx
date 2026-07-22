import { cn } from "@/lib/utils";

interface SectorStripProps {
  /** "idle" shows three static dim segments; "loading" animates a sweep across them. */
  state?: "idle" | "loading";
  className?: string;
}

/**
 * The recurring visual signature of this app: a hairline bar split into
 * three segments, echoing the mini-sector display on F1 broadcast timing
 * towers (purple = fastest overall, green = personal best, yellow =
 * mid-pack). It tops every Card and doubles as a loading indicator, so
 * the one motif carries two real jobs instead of being pure decoration.
 */
export function SectorStrip({ state = "idle", className }: SectorStripProps) {
  return (
    <div
      className={cn(
        "sector-strip",
        state === "loading" ? "sector-strip-loading" : "sector-strip-idle",
        className
      )}
      role="presentation"
    >
      <span />
      <span />
      <span />
    </div>
  );
}
