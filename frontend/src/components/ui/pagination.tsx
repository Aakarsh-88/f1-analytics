"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between border-t border-line px-4 py-3" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-[rgb(var(--text-secondary))] transition-colors hover:bg-[rgb(var(--surface-elevated))] disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <span className="font-mono text-xs text-[rgb(var(--text-secondary))]">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(
          "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-[rgb(var(--text-secondary))] transition-colors hover:bg-[rgb(var(--surface-elevated))]",
          "disabled:pointer-events-none disabled:opacity-40"
        )}
      >
        Next
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
