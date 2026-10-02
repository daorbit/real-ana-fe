import { Loader } from "@mantine/core";
import { timeAgo } from "@/shared/lib";
import { DashboardMenu } from "@/features/dashboards/components/home/DashboardMenu";
import { BUSY_LABEL } from "@/features/dashboards/components/home/cardBusy";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import { rangeLong } from "@/features/dashboards/types";
import type { CardBusy } from "@/features/dashboards/components/home/cardBusy";
import type { Dashboard } from "@/features/dashboards/types";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function DashboardTable({
  dashboards,
  canEdit,
  busy,
  onOpen,
  onDuplicate,
  onDelete,
}: {
  dashboards: Dashboard[];
  canEdit: boolean;
  busy: Record<string, CardBusy>;
  onOpen: (d: Dashboard) => void;
  onDuplicate: (d: Dashboard) => void;
  onDelete: (d: Dashboard) => void;
}) {
  return (
    <div className={classes.table} role="table" aria-label="Dashboards">
      <div className={classes.tableHead} role="row">
        <span role="columnheader">Name</span>
        <span role="columnheader">Widgets</span>
        <span role="columnheader">Range</span>
        <span role="columnheader">Last edited</span>
        <span />
      </div>
      {dashboards.map((d) => {
        const template = TEMPLATE_MAP[d.template] ?? TEMPLATE_MAP.blank;
        const Icon = template.icon;
        const state = busy[d.id] ?? null;
        return (
          <div
            key={d.id}
            role="row"
            tabIndex={0}
            className={`${classes.tableRow} ${shared.accent}`}
            data-accent={template.accent}
            aria-busy={Boolean(state)}
            onClick={() => onOpen(d)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(d)}
          >
            <span className={classes.tableName} role="cell">
              <span className={classes.tableIcon}><Icon size={15} /></span>
              <span className={classes.tableTitles}>
                <span className={classes.tableTitle}>{d.name}</span>
                <span className={classes.tableSub}>{template.id === "blank" ? "Custom layout" : template.name}</span>
              </span>
            </span>
            <span className={classes.tableCell} role="cell">{d.layout.length}</span>
            <span className={classes.tableCell} role="cell">{rangeLong(d.range)}</span>
            <span className={classes.tableCell} role="cell">
              {state ? (
                <span className={classes.tableBusy}><Loader size={12} color="gray" /> {BUSY_LABEL[state]}</span>
              ) : (
                timeAgo(d.updatedAt)
              )}
            </span>
            <span className={classes.tableActions} role="cell">
              {canEdit && <DashboardMenu onDuplicate={() => onDuplicate(d)} onDelete={() => onDelete(d)} />}
            </span>
          </div>
        );
      })}
    </div>
  );
}
