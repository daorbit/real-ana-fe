import { FileSpreadsheet } from "lucide-react";
import type { ReportTemplate } from "./reportTemplates";
import classes from "./ReportsStart.module.css";

export function ReportEmailPreview({ template, workspace }: { template: ReportTemplate; workspace: string }) {
  return (
    <div className={classes.email} aria-hidden>
      <div className={classes.emailMeta}>
        <span className={classes.emailFrom}>
          <span className={classes.emailAvatar}>Q</span>
          Quantalog Reports
        </span>
        <span className={classes.emailBadge}>{template.cadence}</span>
      </div>
      <div className={classes.emailSubject}>
        {workspace ? `${workspace} · ` : ""}
        {template.title}
      </div>

      <div className={classes.emailStats}>
        {template.stats.map((s) => (
          <span key={s.label} className={classes.emailStat}>
            <span className={classes.emailStatValue}>{s.value}</span>
            <span className={classes.emailStatLabel}>{s.label}</span>
          </span>
        ))}
      </div>

      <div className={classes.emailChart}>
        {template.bars.map((h, i) => (
          <span key={i} className={classes.emailBar} data-h={h} />
        ))}
      </div>

      {template.summary && (
        <div className={classes.emailSummary}>
          <span className={classes.emailSummaryLabel}>Summary</span>
          <span className={classes.line} data-width="full" />
          <span className={classes.line} data-width="most" />
        </div>
      )}

      {(template.spreadsheet || template.dashboardLink) && (
        <div className={classes.emailFooter}>
          {template.spreadsheet && (
            <span className={classes.emailAttachment}>
              <FileSpreadsheet size={13} />
              report.xlsx
            </span>
          )}
          {template.dashboardLink && <span className={classes.emailButton}>Open live dashboard</span>}
        </div>
      )}
    </div>
  );
}
