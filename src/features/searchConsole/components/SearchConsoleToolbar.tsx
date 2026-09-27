import { ActionIcon, Menu, Select, Text, Tooltip } from "@mantine/core";
import { CalendarDays, ExternalLink, Link2Off, MoreHorizontal, RefreshCw, Unplug } from "lucide-react";
import { useRefreshSearchPerformanceMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { timeAgo } from "@/shared/lib";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import type { SearchType } from "@/shared/types";
import { RANGES, SEARCH_TYPE_OPTIONS, propertyLabel } from "../searchMetrics";
import type { SearchConsoleLink } from "./SearchConsoleGate";
import { PageFinder } from "./PageFinder";
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
  fetchedAt,
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  onDaysChange: (days: number) => void;
  type: SearchType;
  onTypeChange: (type: SearchType) => void;
  link: SearchConsoleLink;
  busy: boolean;
  fetchedAt?: string;
  onOpenPage: (url: string) => void;
}) {
  const [refresh, { isLoading: refreshing }] = useRefreshSearchPerformanceMutation();
  const consoleUrl = `https://search.google.com/search-console?resource_id=${encodeURIComponent(link.propertyUrl)}`;

  const reload = async () => {
    try {
      await refresh({ workspaceId, siteId, days, type }).unwrap();
      notify.success("Fresh numbers from Google");
    } catch (e) {
      notify.error(errMessage(e, "Could not refresh from Google."));
    }
  };

  return (
    <div className={classes.toolbar}>
      <div className={classes.headerText}>
        <span className={classes.brandMark}>
          <GoogleMark size={18} />
        </span>
        <div className={classes.propertyText}>
          <Text fw={650} size="sm" truncate>
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
            {fetchedAt && (
              <>
                <span className={classes.metaDot} />
                <span>Updated {timeAgo(fetchedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={classes.headerActions}>
        <PageFinder
          workspaceId={workspaceId}
          siteId={siteId}
          propertyUrl={link.propertyUrl}
          days={days}
          type={type}
          onOpen={onOpenPage}
        />
        <Select
          size="sm"
          className={classes.typeSelect}
          aria-label="Search type"
          data={SEARCH_TYPE_OPTIONS}
          value={type}
          onChange={(v) => v && onTypeChange(v as SearchType)}
          allowDeselect={false}
          disabled={refreshing}
        />
        <Select
          size="sm"
          className={classes.rangeSelect}
          aria-label="Date range"
          leftSection={<CalendarDays size={14} />}
          data={RANGES.map((r) => ({ value: r.value, label: `Last ${r.label}` }))}
          value={String(days)}
          onChange={(v) => v && onDaysChange(Number(v))}
          allowDeselect={false}
          disabled={refreshing}
        />
        <Tooltip label="Fetch the latest from Google" withArrow>
          <ActionIcon
            variant="default"
            size={36}
            loading={refreshing || busy}
            onClick={() => void reload()}
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </ActionIcon>
        </Tooltip>
        <Menu position="bottom-end" withArrow width={280}>
          <Menu.Target>
            <ActionIcon variant="default" size={36} aria-label="Search visibility settings">
              <MoreHorizontal size={15} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              component="a"
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              leftSection={<ExternalLink size={14} />}
            >
              Open in Google Search Console
            </Menu.Item>
            {link.onChangeProperty && (
              <Menu.Item leftSection={<Link2Off size={14} />} onClick={link.onChangeProperty}>
                Change property
              </Menu.Item>
            )}
            {link.onDisconnect && (
              <>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Unplug size={14} />} onClick={link.onDisconnect}>
                  Disconnect Search visibility
                </Menu.Item>
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
