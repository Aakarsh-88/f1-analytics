import { Inter, JetBrains_Mono, Titillium_Web } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { AuthProvider } from "@/lib/auth/provider";

// Ignore missing type declarations for global CSS imports in this file
// TypeScript may complain if '*.css' module types are not declared.
// @ts-ignore
import "./globals.css";

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "F1 Analytics",
  description:
    "Formula 1 historical race, driver, and championship analytics dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${titillium.variable} ${inter.variable} ${jetbrainsMono.variable} font-body`}
      >
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}