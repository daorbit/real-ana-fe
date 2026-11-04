import { Tooltip } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Stat } from "./Stat";
import classes from "./Workspaces.module.css";

export function SiteStatusStat({ installed }: { installed: boolean | null }) {
  const { t } = useTranslation();
  const label = t("workspaces.statStatus");

  if (installed === null) return <Stat label={label} value="—" />;

  return (
    <Stat
      label={label}
      value={
        <Tooltip label={installed ? t("workspaces.receivingData") : t("workspaces.waitingFirstView")} withArrow>
          <span className={classes.status} data-live={installed || undefined}>
            <span className={classes.statusDot} />
            {installed ? t("workspaces.statusLive") : t("workspaces.statusWaiting")}
          </span>
        </Tooltip>
      }
    />
  );
}
