/**
 * Maps constructor_ref (from the backend's Constructor model) to explicit
 * Tailwind utility classes.
 *
 * IMPORTANT: these class names must appear literally in source for
 * Tailwind's JIT compiler to include them in the build — a dynamic
 * template string like `border-team-${slug}` would silently produce NO
 * styles in production, since Tailwind never sees the concrete class
 * name at build time. This lookup table is what makes team coloring
 * both dynamic (driven by data) and JIT-safe (every class is static text
 * somewhere in this file).
 */
export const TEAM_BORDER_CLASS: Record<string, string> = {
  mercedes: "border-team-mercedes",
  red_bull: "border-team-redbull",
  ferrari: "border-team-ferrari",
  mclaren: "border-team-mclaren",
  aston_martin: "border-team-astonmartin",
  alpine: "border-team-alpine",
  williams: "border-team-williams",
  rb: "border-team-rb",
  sauber: "border-team-sauber",
  haas: "border-team-haas",
};

export const TEAM_TEXT_CLASS: Record<string, string> = {
  mercedes: "text-team-mercedes",
  red_bull: "text-team-redbull",
  ferrari: "text-team-ferrari",
  mclaren: "text-team-mclaren",
  aston_martin: "text-team-astonmartin",
  alpine: "text-team-alpine",
  williams: "text-team-williams",
  rb: "text-team-rb",
  sauber: "text-team-sauber",
  haas: "text-team-haas",
};

const DEFAULT_BORDER_CLASS = "border-line";
const DEFAULT_TEXT_CLASS = "text-[rgb(var(--text-secondary))]";

export function getTeamBorderClass(constructorRef: string): string {
  return TEAM_BORDER_CLASS[constructorRef] ?? DEFAULT_BORDER_CLASS;
}

export function getTeamTextClass(constructorRef: string): string {
  return TEAM_TEXT_CLASS[constructorRef] ?? DEFAULT_TEXT_CLASS;
}
