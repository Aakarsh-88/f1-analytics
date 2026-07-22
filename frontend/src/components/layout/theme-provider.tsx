"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Wraps next-themes. Defaults to dark mode — the F1 broadcast/timing-tower
 * aesthetic this app is built around is designed dark-first; light mode is
 * a fully supported alternative, not an afterthought, but dark is what a
 * first-time visitor should see.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
