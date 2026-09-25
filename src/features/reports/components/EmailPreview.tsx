import { CalendarClock, FileSpreadsheet, Mail, MessageCircle, Pause, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n/locale/i18n";
import type { Site } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { computeNextRun, frequencyLabel, nextRunLabel } from "@/features/reports/pages/utils";
import classes from "./Reports.module.css";

const DAY = 86_400_000;

/** The period the next send covers: the day, week or month before it lands. */
function coveredRange(draft: Draft): string {
  const next = computeNextRun(draft.frequency);
  const end = new Date(next.getTime() - DAY);
  let start = end;
  if (draft.frequency === "weekly") start = new Date(end.getTime() - 6 * DAY);
  if (draft.frequency === "monthly") start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  const fmt = (d: Date) =>
    d.toLocaleDateString(i18n.language, { day: "numeric", month: "short", timeZone: "UTC" });
  return draft.frequency === "daily" ? fmt(end) : `${fmt(start)} – ${fmt(end)}`;
}

const TILE_KEYS = ["previewVisitors", "previewPageviews", "previewSessions", "previewBounce"] as const;

/**
 * What a recipient gets, drawn as an email. Figures are placeholders — the
 * point is which sections arrive and in what order, not the numbers.
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

  const picked = draft.siteIds.length
    ? sites.filter((s) => draft.siteIds.includes(s.siteId))
    : sites;
  const scopeLabel = draft.siteIds.length
    ? picked.map((s) => s.name).join(", ")
    : t("reports.allSitesIn", { workspace: workspace || t("reports.thisWorkspace") });

  const to = [ownerEmail || t("reports.previewFlowYou"), ...draft.recipients];
  const toLabel = to.length > 2 ? `${to.slice(0, 2).join(", ")} +${to.length - 2}` : to.join(", ");
  const name = draft.name.trim() || t("reports.untitled");

  const showAi = draft.analytics && draft.aiSummary;
  const showLink = draft.dashboardLink;
  const showXlsx = draft.attachXlsx && draft.emailChannel;
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
            {name} · {frequencyLabel(draft.frequency)}
          </span>
        </div>

        {empty ? (
          <div className={classes.mailEmpty}>{t("reports.previewEmpty")}</div>
        ) : (
          <div className={classes.mailBody}>
            <div>
              <div className={classes.mailKicker}>{scopeLabel}</div>
              <h4 className={classes.mailHeading}>{name}</h4>
              <div className={classes.mailRange}>{coveredRange(draft)}</div>
            </div>

            {showAi && (
              <div className={classes.mailBlock}>
                <div className={classes.aiBox}>
                  <div className={classes.mailBlockTitle}>
                    <Sparkles size={13} />
                    {t("reports.includeAiLabel")}
                  </div>
                  <div className={classes.line} style={{ width: "96%" }} />
                  <div className={classes.line} style={{ width: "88%" }} />
                  <div className={classes.line} style={{ width: "54%" }} />
                </div>
              </div>
            )}

            {draft.analytics && (
              <div className={classes.mailBlock}>
                <div className={classes.mailBlockTitle}>{t("reports.includeAnalyticsLabel")}</div>
                <div className={classes.tiles}>
                  {TILE_KEYS.map((k) => (
                    <div key={k} className={classes.tile}>
                      <span className={classes.tileLabel}>{t(`reports.${k}`)}</span>
                      <span className={classes.tileValue} />
                      <span className={classes.tileDelta} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {draft.seo && (
              <div className={classes.mailBlock}>
                <div className={classes.mailBlockTitle}>{t("reports.includeSeoLabel")}</div>
                <div>
                  {(picked.length ? picked.slice(0, 3) : [{ siteId: "_", name: t("reports.allSitesPlaceholder") }]).map((s) => (
                    <div key={s.siteId} className={classes.seoRow}>
                      <span className={classes.seoSite}>{s.name}</span>
                      <span className={classes.seoScore} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showLink && (
              <div className={classes.mailBlock}>
                {shareEnabled ? (
                  <span className={classes.mailButton}>{t("reports.previewOpenDashboard")}</span>
                ) : (
                  <span className={classes.mailNote}>{t("reports.previewLinkOff")}</span>
                )}
              </div>
            )}

            {showXlsx && (
              <div className={classes.mailBlock}>
                <div className={classes.attachment}>
                  <span className={classes.attachmentIcon}>
                    <FileSpreadsheet size={16} />
                  </span>
                  <span>
                    <div className={classes.attachmentName}>report.xlsx</div>
                    <div className={classes.attachmentMeta}>{t("reports.includeXlsxDesc")}</div>
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={classes.mailFoot}>
          {t("reports.previewFooter")} <u>{t("reports.previewUnsubscribe")}</u>
        </div>
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
      </div>
    </div>
  );
}
