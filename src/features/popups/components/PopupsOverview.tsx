import { compact } from "@/shared/lib/format";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import { formatRate } from "@/features/popups/lib/popupOptions";
import type { Popup } from "@/features/popups/types";
import classes from "@/features/popups/components/Popups.module.css";

export function PopupsOverview({ popups, statsDays }: { popups: Popup[]; statsDays: number }) {
  const live = popups.filter((p) => p.enabled).length;
  const views = popups.reduce((sum, p) => sum + p.stats.views, 0);
  const submits = popups.reduce((sum, p) => sum + p.stats.submits, 0);
  const period = `Last ${statsDays} days`;

  return (
    <div className={classes.overview}>
      <StatTileGrid>
        <StatTile label="Live now" value={`${live} of ${popups.length}`} note={live ? "Showing on your sites" : "All paused"} />
        <StatTile label="Views" value={compact(views)} note={period} />
        <StatTile label="Leads" value={compact(submits)} note={period} />
        <StatTile label="Conversion" value={formatRate(views, submits)} note="Leads per view" />
      </StatTileGrid>
    </div>
  );
}
