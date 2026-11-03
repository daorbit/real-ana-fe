import { Menu, Tooltip, UnstyledButton } from "@mantine/core";
import { ExternalLink, Globe, Link2Off, LogOut, MoreHorizontal, RotateCw } from "lucide-react";
import { useRefreshSearchPerformanceMutation } from "@/app/store";
import { errMessage, notify } from "@/shared/lib/notify";
import { timeAgo } from "@/shared/lib";
import type { SearchType } from "@/shared/types";
import { propertyLabel } from "../searchMetrics";
import { SearchRangeSelect } from "./SearchRangeSelect";
import { SearchTypeMenu } from "./SearchTypeMenu";
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
  fetchedAt,
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
}) {
  const [refresh, { isLoading: refreshing }] = useRefreshSearchPerformanceMutation();
  const consoleUrl = `https://search.google.com/search-console?resource_id=${encodeURIComponent(link.propertyUrl)}`;
  const spinning = refreshing || busy;

  const reload = async () => {
    try {
      await refresh({ workspaceId, siteId, days, type }).unwrap();
      notify.success("Fresh numbers from Google");
    } catch (e) {
      notify.error(errMessage(e, "Could not refresh from Google."));
    }
  };

  const meta = [
    link.propertyUrl.startsWith("sc-domain:") ? "Domain property" : "URL-prefix property",
    link.googleEmail || null,
    fetchedAt ? `Updated ${timeAgo(fetchedAt)}` : null,
  ].filter(Boolean);

  return (
    <div className={classes.toolbar}>
      <div className={classes.headerText}>
        <span className={classes.brandMark} aria-hidden>
          <Globe size={16} />
        </span>
        <div className={classes.propertyText}>
          <span className={classes.propertyName}>{propertyLabel(link.propertyUrl)}</span>
          <span className={classes.meta}>{meta.join(" · ")}</span>
        </div>
      </div>

      <div className={classes.headerActions}>
        <div className={classes.filters}>
          <SearchTypeMenu type={type} onChange={onTypeChange} disabled={refreshing} />
          <SearchRangeSelect days={days} onChange={onDaysChange} disabled={refreshing} />
        </div>
        <Tooltip label="Fetch the latest from Google" withArrow>
          <UnstyledButton
            className={classes.iconButton}
            aria-label="Fetch the latest from Google"
            disabled={spinning}
            onClick={() => void reload()}
          >
            <RotateCw size={15} className={spinning ? "spin" : undefined} />
          </UnstyledButton>
        </Tooltip>
        <Menu position="bottom-end" width={270}>
          <Menu.Target>
            <UnstyledButton className={classes.iconButton} aria-label="Search visibility settings">
              <MoreHorizontal size={16} />
            </UnstyledButton>
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
                <Menu.Item color="red" leftSection={<LogOut size={14} />} onClick={link.onDisconnect}>
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
