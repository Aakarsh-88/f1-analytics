"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--surface-bg))] px-6 text-center">
      <div className="rounded-full bg-f1-red/10 p-4 text-f1-red">
        <AlertTriangle size={32} strokeWidth={2} />
      </div>
      <h1 className="mt-6 font-display text-xl font-bold">Session red-flagged</h1>
      <p className="mt-2 max-w-md text-sm text-[rgb(var(--text-secondary))]">
        Something went wrong loading this page. The error has been logged.
      </p>
      <Button className="mt-6" onClick={reset}>
        Restart session
      </Button>
    </div>
  );
}
