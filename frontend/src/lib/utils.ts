import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names AND resolves conflicting Tailwind
 * utilities (e.g. `cn("p-2", condition && "p-4")` correctly keeps only
 * `p-4` when `condition` is true, instead of both classes fighting).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
