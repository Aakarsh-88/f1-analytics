import type { Config } from "tailwindcss";

/**
 * Design tokens for the F1 Analytics dashboard.
 *
 * Color naming follows the SOURCE of each color's meaning, not just its
 * hue — `sector.purple/green/yellow` mirror F1's own broadcast timing
 * convention (purple = fastest overall, green = personal best, yellow =
 * mid-pack), so components can say `text-sector-purple` and mean
 * "this is the fastest" rather than an arbitrary color choice.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: "#0A0C0F",
          900: "#14171C",
          800: "#1D2127",
          700: "#282D35",
        },
        line: {
          DEFAULT: "#2A2F37",
          light: "#E2E4E9",
        },
        paper: "#F4F5F7",
        f1: {
          red: "#E10600",
          "red-dark": "#B00500",
        },
        sector: {
          purple: "#9B5DE5",
          green: "#00D97E",
          yellow: "#FFD400",
        },
        tire: {
          soft: "#DA291C",
          medium: "#FFD400",
          hard: "#F0F0F0",
          intermediate: "#43B02A",
          wet: "#0067AD",
        },
        team: {
          mercedes: "#27F4D2",
          redbull: "#3671C6",
          ferrari: "#E8002D",
          mclaren: "#FF8000",
          astonmartin: "#229971",
          alpine: "#FF87BC",
          williams: "#64C4FF",
          rb: "#6692FF",
          sauber: "#52E252",
          haas: "#B6BABD",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "carbon-weave":
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 6px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 6px)",
      },
      keyframes: {
        "sector-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "speed-in": {
          "0%": { transform: "translateX(-16px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "pit-wipe": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "sector-sweep": "sector-sweep 2.2s linear infinite",
        "speed-in": "speed-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pit-wipe": "pit-wipe 0.6s cubic-bezier(0.65, 0, 0.35, 1)",
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
