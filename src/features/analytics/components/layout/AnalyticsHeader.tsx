import type { ReactNode } from "react";
import { ActionIcon, Title, Tooltip } from "@mantine/core";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RefreshButton } from "@/shared/ui/Refresh";
import { DocsButton } from "@/shared/ui/DocsButton";
import { ActivityBellIcon } from "@/features/activity/ActivityBell";
import classes from "./AnalyticsLayout.module.css";

export function AnalyticsHeader({
  subtitle,
  onRefresh,
  refreshing,
  lastUpdated,
  exportMenu,
  onHelp,
}: {
  subtitle: ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated: Date | null;
  exportMenu: ReactNode;
  onHelp: () => void;
}) {
  const { t } = useTranslation();

  return (
    <header className={classes.header}>
      <div className={classes.headerText}>
        <Title order={1}>{t("analytics.title")}</Title>
        <div className={classes.subtitle}>{subtitle}</div>
      </div>

      <div className={`${classes.actions} an-toolbar-btns`}>
        <RefreshButton onRefresh={onRefresh} refreshing={refreshing} lastUpdated={lastUpdated} />
        {exportMenu}
        <Tooltip label={t("analytics.helpTooltip")} withArrow>
          <ActionIcon variant="default" size="lg" onClick={onHelp} aria-label={t("analytics.help")}>
            <HelpCircle size={17} />
          </ActionIcon>
        </Tooltip>
        <DocsButton path="/overview" />
        <ActivityBellIcon />
      </div>
    </header>
  );
}
