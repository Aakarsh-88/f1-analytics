import { SectorStrip } from "@/components/ui/sector-strip";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[rgb(var(--surface-bg))]">
      <div className="w-48">
        <SectorStrip state="loading" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-[rgb(var(--text-secondary))]">
        Loading telemetry…
      </p>
    </div>
  );
}
