import { CalendarClock, FileSpreadsheet, Mail, MessageCircle, Pause } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Site } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { computeNextRun, nextRunLabel } from "@/features/reports/pages/utils";
import classes from "./Reports.module.css";

const DAY = 86_400_000;

/** How far back each frequency looks — the server's `rangeForFrequency`. */
const WINDOW_DAYS = { daily: 1, weekly: 7, monthly: 30 } as const;

/**
 * The period line exactly as the server writes it (`periodLabel` in
 * report-runner.ts): en-GB dates in UTC, "24 hours to …" for daily, a range
 * otherwise. Windows are rolling, ending at the send time.
 */
function periodLabel(draft: Draft): string {
  const until = computeNextRun(draft.frequency);
  const since = new Date(until.getTime() - WINDOW_DAYS[draft.frequency] * DAY);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return draft.frequency === "daily" ? `24 hours to ${fmt(until)}` : `${fmt(since)} — ${fmt(until)}`;
}

/** The attachment's file name, as the server builds it (`slug` in report-mail.ts). */
function attachmentName(workspace: string): string {
  const slug = workspace.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return `${slug || "quantalog"}-report.xlsx`;
}

/** The metrics `buildMetrics` sends, in order. */
const METRICS = ["Visitors", "Pageviews", "Sessions", "Bounce rate", "Avg. session", "Pages / session"];

/**
 * The report email, drawn after `sendReportEmail` in the backend's
 * report-mail.ts: same subject, same sections in the same order, same button
 * and footer. Emails render on white, so this does too in either theme.
 * Figures are placeholders; the structure is what it shows.
 */
export function EmailPreview({
  draft,
  sites,
  ownerEmail,
  shareEnabled,
  workspace,
}: {
  draft: Draft;
  sites: Site[];
  ownerEmail: string;
  shareEnabled: boolean;
  workspace: string;
}) {
  const { t } = useTranslation();
  const ws = workspace || t("reports.thisWorkspace");
  const period = periodLabel(draft);

  const picked = draft.siteIds.length ? sites.filter((s) => draft.siteIds.includes(s.siteId)) : sites;
  const to = [ownerEmail || t("reports.previewFlowYou"), ...draft.recipients];
  const toLabel = to.length > 2 ? `${to.slice(0, 2).join(", ")} +${to.length - 2}` : to.join(", ");

  const showAi = draft.analytics && draft.aiSummary;
  const showXlsx = draft.attachXlsx && draft.emailChannel;
  const linked = draft.dashboardLink && shareEnabled;
  const empty = !draft.analytics && !draft.seo;

  return (
    <div>
      <div className={classes.previewHead}>
        <div>
          <div className={classes.previewTitle}>{t("reports.previewTitle")}</div>
          <div className={classes.previewHint}>{t("reports.previewEmailHint")}</div>
        </div>
      </div>

      <div className={classes.mail}>
        <div className={classes.mailMeta}>
          <span className={classes.mailMetaLabel}>{t("reports.previewTo")}</span>
          <span className={classes.mailMetaValue} title={to.join(", ")}>{toLabel}</span>
          <span className={classes.mailMetaLabel}>{t("reports.previewSubject")}</span>
          <span className={`${classes.mailMetaValue} ${classes.mailSubject}`}>
            {ws} — {period}
          </span>
        </div>

        <div className={classes.mailBanner} aria-hidden />

        {empty ? (
          <div className={classes.mailEmpty}>{t("reports.previewEmpty")}</div>
        ) : (
          <div className={classes.mailBody}>
            <div>
              <h4 className={classes.mailHeading}>{ws}</h4>
              <div className={classes.mailRange}>{period}</div>
            </div>

            {showAi && (
              <div className={classes.mailBlock}>
                <div className={classes.aiBox}>
                  <div className={classes.mailKicker}>AI summary</div>
                  <div className={classes.line} style={{ width: "96%" }} />
                  <div className={classes.line} style={{ width: "90%" }} />
                  <div className={classes.line} style={{ width: "62%" }} />
                  <div className={classes.aiAction}>
                    <strong>Worth doing:</strong>
                    <span className={classes.line} style={{ width: "46%" }} />
                  </div>
                </div>
              </div>
            )}

            {draft.analytics && (
              <div className={classes.mailBlock}>
                <div className={classes.tiles}>
                  {METRICS.map((m) => (
                    <div key={m} className={classes.tile}>
                      <span className={classes.tileLabel}>{m}</span>
                      <span className={classes.tileValue} />
                      <span className={classes.tileDelta} />
                    </div>
                  ))}
                </div>
                <div className={classes.mailSection}>Top pages</div>
                <div className={classes.bars}>
                  {[92, 64, 41].map((w) => (
                    <div key={w} className={classes.barRow}>
                      <span className={classes.line} style={{ width: "34%" }} />
                      <span className={classes.bar}>
                        <i style={{ width: `${w}%` }} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draft.seo && (
              <div className={classes.mailBlock}>
                <div className={classes.mailBlockTitle}>SEO scores</div>
                <div className={classes.seoTable}>
                  <div className={classes.seoHead}>
                    <span>Page</span>
                    <span>Score</span>
                    <span>Change</span>
                  </div>
                  {(picked.length ? picked.slice(0, 3) : [{ siteId: "_", name: ws }]).map((s) => (
                    <div key={s.siteId} className={classes.seoRow}>
                      <span className={classes.seoSite}>{s.name}</span>
                      <span className={classes.seoScore} />
                      <span className={classes.seoMove} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showXlsx && (
              <div className={classes.mailBlock}>
                <div className={classes.mailAside}>The full breakdown is attached as a spreadsheet.</div>
                <div className={classes.attachment}>
                  <span className={classes.attachmentIcon}>
                    <FileSpreadsheet size={16} />
                  </span>
                  <span className={classes.attachmentName}>{attachmentName(ws)}</span>
                </div>
              </div>
            )}

            <span className={classes.mailButton}>{linked ? "Open live dashboard" : "Open Quantalog"}</span>
            {draft.dashboardLink && !shareEnabled && (
              <div className={classes.mailNote}>{t("reports.previewLinkOff")}</div>
            )}

            <div className={classes.mailFoot}>
              Someone shares their Quantalog reports with you. <u>Unsubscribe</u>.
            </div>
          </div>
        )}
      </div>

      <div className={classes.previewFacts}>
        {draft.enabled ? (
          <span>
            <CalendarClock size={13} />
            {t("reports.previewNextSend", { when: nextRunLabel(draft.frequency) })}
          </span>
        ) : (
          <span className={classes.pausedTag}>
            <Pause size={13} />
            {t("reports.previewPausedNote")}
          </span>
        )}
        {draft.emailChannel && (
          <span>
            <Mail size={13} />
            {t("reports.emailCount", { count: to.length })}
          </span>
        )}
        {draft.whatsappChannel && (
          <span>
            <MessageCircle size={13} />
            {t("reports.previewWhatsAppCopy")}
          </span>
        )}
        {!draft.emailChannel && !draft.whatsappChannel && <span>{t("reports.previewNoChannel")}</span>}
        {showAi && <span className={classes.factNote}>{t("reports.previewAiSkipped")}</span>}
      </div>
    </div>
  );
}
