"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

export function Tabs({ items, defaultValue }: { items: TabItem[]; defaultValue?: string }) {
  const [active, setActive] = useState(defaultValue ?? items[0]?.value);

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-line">
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active === item.value}
            onClick={() => setActive(item.value)}
            className={cn(
              "relative px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors",
              active === item.value
                ? "text-f1-red"
                : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            )}
          >
            {item.label}
            {active === item.value && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-f1-red" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
      <div className="pt-4">{items.find((i) => i.value === active)?.content}</div>
    </div>
  );
}
