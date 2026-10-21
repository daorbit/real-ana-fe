import { Activity, BarChart3, Gauge, Share2, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import classes from "./SetupScreen.module.css";

type Highlight = { key: string; icon: LucideIcon; title: string; detail: string };

const HIGHLIGHTS: Highlight[] = [
  { key: "traffic", icon: BarChart3, title: "Visitors and pageviews", detail: "Every visit, counted without cookies" },
  { key: "live", icon: Activity, title: "Live right now", detail: "Who is on your site this minute" },
  { key: "sources", icon: Share2, title: "Where they come from", detail: "Search, social, referrers and campaigns" },
  { key: "vitals", icon: Gauge, title: "Core Web Vitals", detail: "How fast your pages feel to real people" },
];

export function SetupHighlights() {
  const { t } = useTranslation();

  return (
    <div className={classes.highlights}>
      <span className={classes.highlightsLabel}>
        {t("setup.highlightsLabel", "What appears here after your first visit")}
      </span>
      <ul className={classes.highlightList}>
        {HIGHLIGHTS.map(({ key, icon: Icon, title, detail }) => (
          <li key={key} className={classes.highlight}>
            <span className={classes.highlightIcon}>
              <Icon size={16} strokeWidth={1.9} />
            </span>
            <span className={classes.highlightTitle}>{t(`setup.highlight.${key}Title`, title)}</span>
            <span className={classes.highlightDetail}>{t(`setup.highlight.${key}Detail`, detail)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
