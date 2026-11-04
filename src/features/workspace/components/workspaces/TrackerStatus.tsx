import { ActionIcon, Tooltip } from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTrackerVersion } from "@/features/workspace";
import { Stat } from "./Stat";
import classes from "./Workspaces.module.css";

interface Props {
  workspaceId: string;
  siteId: string;
}

export function TrackerStatus({ workspaceId, siteId }: Props) {
  const { t } = useTranslation();
  const version = useTrackerVersion(workspaceId, siteId);
  const label = t("workspaces.statTracker");

  if (!version) return <Stat label={label} value="—" />;

  const { current, latest, upToDate, recheck, checking } = version;

  return (
    <Stat
      label={label}
      value={
        <span className={classes.trackerValue}>
          <Tooltip
            multiline
            w={260}
            withArrow
            label={
              upToDate
                ? t("workspaces.trackerLatestD", { latest, defaultValue: "Running the latest tracker, v{{latest}}." })
                : t("workspaces.trackerUpdatingD", {
                    current,
                    latest,
                    defaultValue:
                      "Last reported v{{current}}. Visitors pick up v{{latest}} on their next page view — no change to your snippet needed.",
                  })
            }
          >
            <span>v{current}</span>
          </Tooltip>
          <Tooltip label={t("workspaces.trackerRecheck", "Check tracker version again")} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              radius="xl"
              size={24}
              loading={checking}
              onClick={() => void recheck()}
              aria-label={t("workspaces.trackerRecheck", "Check tracker version again")}
            >
              <RefreshCw size={13} />
            </ActionIcon>
          </Tooltip>
        </span>
      }
      hint={upToDate ? undefined : t("workspaces.trackerUpdating", { latest, defaultValue: "Updating to v{{latest}}" })}
    />
  );
}
