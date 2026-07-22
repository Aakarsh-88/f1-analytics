"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Styled as a physical two-position switch (like a cockpit toggle) rather
 * than a sun/moon icon-button — small, deliberate detail that reinforces
 * the racing-instrumentation feel without adding a new color or shape
 * vocabulary to the page.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoids a hydration mismatch: the server doesn't know the user's
  // stored theme preference, so we render nothing meaningful until
  // after mount.
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

if (!mounted) {
  return null;
}

return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-8 w-14 items-center rounded-full border border-line px-1 transition-colors",
        "bg-carbon-800 dark:bg-carbon-800",
        
      )}
    >
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full bg-f1-red text-white shadow-md transition-transform duration-300",
          isDark ? "translate-x-6" : "translate-x-0"
        )}
      >
        {isDark ? <Moon size={13} strokeWidth={2.5} /> : <Sun size={13} strokeWidth={2.5} />}
      </span>
    </button>
  );
}
