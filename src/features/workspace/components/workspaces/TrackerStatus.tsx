import { ActionIcon, Tooltip } from "@mantine/core";
import { Check, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTrackerVersion } from "@/features/workspace";
import classes from "./Workspaces.module.css";

interface Props {
  workspaceId: string;
  siteId: string;
}

/**
 * Whether a site's visitors are running the tracker the server now serves.
 * Visitors' browsers fetch a new tracker on their next page view, so an
 * outdated site catches up on its own; "check again" just re-reads the status.
 */
export function TrackerStatus({ workspaceId, siteId }: Props) {
  const { t } = useTranslation();
  const version = useTrackerVersion(workspaceId, siteId);
  if (!version) return null;

  const { current, latest, upToDate, recheck, checking } = version;

  return (
    <>
      {upToDate ? (
        <Tooltip label={t("workspaces.trackerLatestD", { latest, defaultValue: "Running the latest tracker, v{{latest}}." })} withArrow>
          <span className={classes.siteTag}>
            <Check size={11} />
            {t("workspaces.trackerVersion", { version: current, defaultValue: "Tracker v{{version}}" })}
          </span>
        </Tooltip>
      ) : (
        <Tooltip
          multiline
          w={260}
          label={t("workspaces.trackerUpdatingD", {
            current,
            latest,
            defaultValue:
              "Last reported v{{current}}. Visitors pick up v{{latest}} on their next page view — no change to your snippet needed.",
          })}
          withArrow
        >
          <span className={classes.status}>
            <span className={classes.statusDot} />
            {t("workspaces.trackerUpdating", { latest, defaultValue: "Updating to v{{latest}}" })}
          </span>
        </Tooltip>
      )}
      <Tooltip label={t("workspaces.trackerRecheck", "Check tracker version again")} withArrow>
        <ActionIcon
          variant="subtle"
          color="gray"
          size={22}
          loading={checking}
          onClick={() => void recheck()}
          aria-label={t("workspaces.trackerRecheck", "Check tracker version again")}
        >
          <RefreshCw size={12} />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
