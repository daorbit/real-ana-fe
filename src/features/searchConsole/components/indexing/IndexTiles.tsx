import { compact } from "@/shared/lib";
import { Tile, Tiles } from "@/features/seo/components/shared/Tile";
import type { IndexCounts, IndexFilter } from "../../indexing";

export function IndexTiles({ counts, onPick }: { counts: IndexCounts; onPick: (filter: IndexFilter) => void }) {
  return (
    <Tiles>
      <Tile
        label="On Google"
        value={compact(counts.indexed)}
        note="Can appear in results"
        tone={counts.indexed ? "good" : undefined}
        onClick={() => onPick("indexed")}
      />
      <Tile
        label="Not on Google"
        value={compact(counts.not_indexed)}
        note="Google left them out"
        tone={counts.not_indexed ? "bad" : undefined}
        onClick={() => onPick("not_indexed")}
      />
      <Tile
        label="Blocked"
        value={compact(counts.blocked)}
        note="Stopped by your own site"
        tone={counts.blocked ? "warn" : undefined}
        onClick={() => onPick("blocked")}
      />
      <Tile
        label="Not checked"
        value={compact(counts.unchecked)}
        note="No result from Google yet"
        onClick={() => onPick("unchecked")}
      />
    </Tiles>
  );
}
