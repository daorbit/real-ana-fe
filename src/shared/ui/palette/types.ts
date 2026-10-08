import type { LucideIcon } from "lucide-react";

export type PaletteCommand = {
  id: string;
  label: string;
  section: string;
  icon: LucideIcon;
  hint?: string;
  keys?: string[];
  keywords?: string;
  run: () => void;
};
