import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Orbit } from "lucide-react";
import { orbitAskPath } from "@/features/orbit/hooks/useAskParam";
import { matchScore } from "@/shared/ui/palette/matchScore";
import { readRecent } from "@/shared/ui/palette/recentCommands";
import type { PaletteCommand } from "@/shared/ui/palette/types";

const IDLE_SECTIONS = new Set(["Go to", "Actions", "Switch workspace"]);
const PER_SECTION = 6;

export function usePaletteResults(commands: PaletteCommand[], query: string, close: () => void): PaletteCommand[] {
  const navigate = useNavigate();

  return useMemo(() => {
    const q = query.trim();

    if (!q) {
      const byId = new Map(commands.map((c) => [c.id, c]));
      const recent = readRecent()
        .map((id) => byId.get(id))
        .filter((c): c is PaletteCommand => Boolean(c))
        .map((c) => ({ ...c, id: `recent:${c.id}`, section: "Recent" }));
      return [...recent, ...commands.filter((c) => IDLE_SECTIONS.has(c.section))];
    }

    const order: string[] = [];
    const groups = new Map<string, { c: PaletteCommand; score: number }[]>();
    for (const c of commands) {
      const score = matchScore(c.label, `${c.section} ${c.keywords ?? ""}`, q);
      if (score <= 0) continue;
      if (!groups.has(c.section)) {
        groups.set(c.section, []);
        order.push(c.section);
      }
      groups.get(c.section)!.push({ c, score });
    }

    const best = (s: string) => Math.max(...groups.get(s)!.map((x) => x.score));
    order.sort((a, b) => best(b) - best(a));

    const matched = order.flatMap((s) =>
      groups.get(s)!
        .sort((a, b) => b.score - a.score)
        .slice(0, PER_SECTION)
        .map((x) => x.c),
    );

    const ask: PaletteCommand = {
      id: "orbit:ask",
      label: `Ask Orbit: “${q}”`,
      section: "Orbit",
      icon: Orbit,
      run: () => {
        navigate(orbitAskPath(q));
        close();
      },
    };

    return [...matched, ask];
  }, [commands, query, navigate, close]);
}
