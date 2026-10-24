import { Skeleton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { num } from "@/shared/lib";
import type { FunnelOverviewRow, SavedFunnel } from "@/shared/types";
import { percentLabel, pointChange } from "../lib/funnelFormat";
import { withSearch } from "../hooks/useFunnelRange";
import { FunnelStepPath } from "./FunnelStepPath";
import classes from "./Funnels.module.css";

export function FunnelList({
  funnels,
  overview,
  loadingOverview,
  search,
}: {
  funnels: SavedFunnel[];
  overview: Map<string, FunnelOverviewRow>;
  loadingOverview: boolean;
  search: string;
}) {
  return (
    <ul className={classes.list}>
      {funnels.map((funnel) => {
        const row = overview.get(funnel.id);
        const change = row ? pointChange(row.conversion, row.previousConversion) : null;
        return (
          <li key={funnel.id}>
            <Link to={withSearch(`/app/funnels/${funnel.id}`, search)} className={classes.listRow}>
              <span className={classes.listMain}>
                <span className={classes.listName}>{funnel.name}</span>
                <FunnelStepPath steps={funnel.steps} compact />
              </span>
              <span className={classes.listStat}>
                <span className={classes.listLabel}>Conversion</span>
                {row ? (
                  <span className={classes.listValueRow}>
                    <span className={classes.listValue}>{percentLabel(row.conversion)}</span>
                    {change && (
                      <span className={classes.listChange} data-tone={change.tone}>
                        {change.label}
                      </span>
                    )}
                  </span>
                ) : loadingOverview ? (
                  <Skeleton height={22} width={70} radius="sm" />
                ) : (
                  <span className={classes.listValue}>—</span>
                )}
              </span>
              <span className={classes.listStat} data-secondary>
                <span className={classes.listLabel}>Entered</span>
                {row ? (
                  <span className={classes.listValue}>{num(row.entered)}</span>
                ) : loadingOverview ? (
                  <Skeleton height={22} width={60} radius="sm" />
                ) : (
                  <span className={classes.listValue}>—</span>
                )}
              </span>
              <ChevronRight size={18} className={classes.listChevron} aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
