"use client";

import { BarChart3, Gauge, MapPin, Settings, Shield, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Gauge },
  { href: "/drivers", label: "Drivers", icon: Users },
  { href: "/constructors", label: "Constructors", icon: Shield },
  { href: "/races", label: "Race Explorer", icon: MapPin },
  { href: "/standings", label: "Championship", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ seasonRange }: { seasonRange: { min: number; max: number } }) {
  const pathname = usePathname();

  return (
    <aside className="texture-carbon hidden w-60 shrink-0 flex-col border-r border-line bg-[rgb(var(--surface-card))] md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-line px-5">
        <div className="h-2.5 w-2.5 rounded-full bg-f1-red" />
        <span className="font-display text-lg font-bold tracking-wide">
          F1<span className="text-f1-red">.</span>ANALYTICS
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-f1-red/10 text-f1-red"
                  : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-elevated))] hover:text-[rgb(var(--text-primary))]"
              )}
            >
              <Icon size={18} strokeWidth={2} />
              {item.label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-f1-red" aria-hidden="true" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4 text-xs text-[rgb(var(--text-secondary))]">
        Data: {seasonRange.min}–{seasonRange.max} seasons
      </div>
    </aside>
  );
}
