import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="texture-carbon flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--surface-bg))] px-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-f1-red" />
        <span className="font-display text-lg font-bold tracking-wide">
          F1<span className="text-f1-red">.</span>ANALYTICS
        </span>
      </div>
      {children}
    </div>
  );
}
