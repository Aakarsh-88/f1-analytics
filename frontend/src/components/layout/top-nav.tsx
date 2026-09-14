"use client";


import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";

import { Building2, Flag, Menu, Search, Trophy, Users, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { NAV_ITEMS } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";
import type { SearchItem, SearchItemType } from "@/types/search";

const TYPE_ICON: Record<SearchItemType, typeof Users> = {
  driver: Users,
  constructor: Building2,
  race: Flag,
  page: Trophy,
};

const TYPE_LABEL: Record<SearchItemType, string> = {
  driver: "Driver",
  constructor: "Constructor",
  race: "Race",
  page: "Standings",
};

const MAX_RESULTS = 8;

export function TopNav({
  searchIndex,
}: {
  searchIndex: SearchItem[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex
      .filter(
        (item) =>
          item.label.toLowerCase().includes(q) || item.sublabel?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS);
  }, [query, searchIndex]);

  // Close the dropdown on outside click — a real cross-page search needs
  // this since, unlike a per-page filter, its results float over content.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <header className="relative flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-line bg-[rgb(var(--surface-card))] px-3 py-3 md:h-16 md:flex-nowrap md:gap-4 md:px-6 md:py-0">
      <div ref={containerRef} className="order-1 relative w-full max-w-none md:order-none md:max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-secondary))]"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search drivers, teams, races…"
          className="w-full rounded-md border border-line bg-[rgb(var(--surface-elevated))] py-2 pl-9 pr-3 text-sm text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-secondary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-f1-red"
        />

        {open && query.trim() && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border border-line bg-[rgb(var(--surface-card))] shadow-xl">
            {results.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-[rgb(var(--text-secondary))]">
                No results for &ldquo;{query}&rdquo;.
              </p>
            ) : (
              <ul>
                {results.map((item) => {
                  const Icon = TYPE_ICON[item.type];
                  return (
                    <li key={`${item.type}-${item.href}-${item.label}`}>
                      <button
                        type="button"
                        onClick={() => goTo(item.href)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                          "hover:bg-[rgb(var(--surface-elevated))]"
                        )}
                      >
                        <Icon size={16} className="shrink-0 text-[rgb(var(--text-secondary))]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{item.label}</span>
                          {item.sublabel && (
                            <span className="block truncate text-xs text-[rgb(var(--text-secondary))]">
                              {item.sublabel}
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 rounded bg-[rgb(var(--surface-elevated))] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[rgb(var(--text-secondary))]">
                          {TYPE_LABEL[item.type]}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="order-2 ml-auto flex items-center gap-2 md:gap-4">
        <button
          type="button"
          aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((current) => !current)}
          className="rounded-md p-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-elevated))] hover:text-[rgb(var(--text-primary))] md:hidden"
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <ThemeToggle />

        <SignedOut>
          <SignInButton mode="modal">
            <button className="whitespace-nowrap rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>

      {mobileNavOpen && (
        <nav className="order-3 w-full border-t border-line pt-2 md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--surface-elevated))] hover:text-[rgb(var(--text-primary))]"
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
