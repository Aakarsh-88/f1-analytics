import { MapPin } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[rgb(var(--surface-bg))] px-6 text-center">
      <div className="rounded-full bg-[rgb(var(--surface-elevated))] p-4 text-[rgb(var(--text-secondary))]">
        <MapPin size={32} strokeWidth={2} />
      </div>
      <h1 className="mt-6 font-display text-4xl font-black">404</h1>
      <p className="mt-2 max-w-md text-sm text-[rgb(var(--text-secondary))]">
        This circuit isn&apos;t on the calendar. The page you&apos;re looking for doesn&apos;t
        exist.
      </p>
      <Link href="/">
        <Button className="mt-6">Back to the paddock</Button>
      </Link>
    </div>
  );
}
