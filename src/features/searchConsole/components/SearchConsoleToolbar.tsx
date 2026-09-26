import { ActionIcon, Menu, SegmentedControl, Select, Text, Tooltip } from "@mantine/core";
import { Link2Off, MoreHorizontal, RefreshCw, Unplug } from "lucide-react";
import { useRefreshSearchPerformanceMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import type { SearchType } from "@/shared/types";
import { RANGES, SEARCH_TYPE_OPTIONS, propertyLabel } from "../searchMetrics";
import type { SearchConsoleLink } from "./SearchConsoleGate";
import classes from "./searchConsole.module.css";

export function SearchConsoleToolbar({
  workspaceId,
  siteId,
  days,
  onDaysChange,
  type,
  onTypeChange,
  link,
  busy,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  onDaysChange: (days: number) => void;
  type: SearchType;
  onTypeChange: (type: SearchType) => void;
  link: SearchConsoleLink;
  busy: boolean;
}) {
  const [refresh, { isLoading: refreshing }] = useRefreshSearchPerformanceMutation();

  const reload = async () => {
    try {
      await refresh({ workspaceId, siteId, days, type }).unwrap();
      notify.success("Fresh numbers from Google");
    } catch (e) {
      notify.error(errMessage(e, "Could not refresh from Google."));
    }
  };

  return (
    <div className={classes.header}>
      <div className={classes.headerText}>
        <span className={classes.brandMark}>
          <GoogleMark size={18} />
        </span>
        <div>
          <Text fw={650} size="sm">
            {propertyLabel(link.propertyUrl)}
          </Text>
          <div className={classes.meta}>
            <span>{link.propertyUrl.startsWith("sc-domain:") ? "Domain property" : "URL-prefix property"}</span>
            {link.googleEmail && (
              <>
                <span className={classes.metaDot} />
                <span>{link.googleEmail}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={classes.headerActions}>
        <Select
          size="xs"
          className={classes.typeSelect}
          aria-label="Search type"
          data={SEARCH_TYPE_OPTIONS}
          value={type}
          onChange={(v) => v && onTypeChange(v as SearchType)}
          allowDeselect={false}
          disabled={busy || refreshing}
        />
        <SegmentedControl
          size="xs"
          value={String(days)}
          onChange={(v) => onDaysChange(Number(v))}
          data={RANGES}
          disabled={busy || refreshing}
        />
        <Tooltip label="Fetch the latest from Google" withArrow>
          <ActionIcon
            variant="default"
            size="lg"
            loading={refreshing}
            onClick={() => void reload()}
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </ActionIcon>
        </Tooltip>
        {(link.onChangeProperty || link.onDisconnect) && (
          <Menu position="bottom-end" withArrow width={230}>
            <Menu.Target>
              <ActionIcon variant="default" size="lg" aria-label="Search visibility settings">
                <MoreHorizontal size={15} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {link.onChangeProperty && (
                <Menu.Item leftSection={<Link2Off size={14} />} onClick={link.onChangeProperty}>
                  Change property
                </Menu.Item>
              )}
              {link.onDisconnect && (
                <Menu.Item color="red" leftSection={<Unplug size={14} />} onClick={link.onDisconnect}>
                  Disconnect Search visibility
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </div>
    </div>
  );
}
