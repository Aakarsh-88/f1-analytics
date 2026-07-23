export type SearchItemType = "driver" | "constructor" | "race" | "page";

export interface SearchItem {
  type: SearchItemType;
  label: string;
  sublabel?: string;
  href: string;
}
