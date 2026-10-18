import { Anchor } from "@mantine/core";
import { SEVERITY } from "@/features/seo/components/shared/Panel";
import { IssueRowActions } from "./IssueRowActions";
import type { IssueRow } from "./issueText";
import classes from "./IssuesPanel.module.css";

export function IssueListMobile({ rows }: { rows: IssueRow[] }) {
  return (
    <ul className={classes.list}>
      {rows.map((row, i) => {
        const s = SEVERITY[row.severity];
        const Icon = s.icon;
        return (
          <li key={`${row.source}-${row.title}-${i}`} className={classes.item} data-severity={row.severity}>
            <span className={classes.icon}>
              <Icon size={15} />
            </span>
            <div className={classes.body}>
              <div className={classes.titleRow}>
                <span className={classes.title}>{row.title}</span>
                <IssueRowActions row={row} />
              </div>
              {row.detail && <p className={classes.detail}>{row.detail}</p>}
              {row.url && (
                <Anchor href={row.url} target="_blank" rel="noopener noreferrer" className={classes.url}>
                  {row.url}
                </Anchor>
              )}
              <div className={classes.meta}>
                <span className={classes.severity}>{s.label}</span>
                <span className={classes.dot} aria-hidden />
                <span className={classes.source}>{row.source}</span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
