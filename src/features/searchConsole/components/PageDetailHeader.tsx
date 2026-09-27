import { ActionIcon, Anchor, Breadcrumbs, Button, Select, Text, Tooltip } from "@mantine/core";
import { ArrowLeft, CalendarDays, ExternalLink, FileText, Home } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { SearchType } from "@/shared/types";
import { RANGES, pagePath } from "../searchMetrics";
import { IndexStatusPill } from "./IndexStatusPill";
import { PageFinder } from "./PageFinder";
import classes from "./pageDetail.module.css";

const BACK_TO = "/app/search-visibility?tab=pages";

export function PageDetailHeader({
  workspaceId,
  siteId,
  propertyUrl,
  pageUrl,
  days,
  type,
  onDaysChange,
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  pageUrl: string;
  days: number;
  type: SearchType;
  onDaysChange: (days: number) => void;
  onOpenPage: (url: string) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = pagePath(pageUrl);
  const isHome = path === "/";
  const Icon = isHome ? Home : FileText;

  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate(BACK_TO));

  return (
    <header className={classes.header}>
      <div className={classes.crumbRow}>
        <Tooltip label="Back" withArrow>
          <ActionIcon variant="default" size={32} radius="md" onClick={goBack} aria-label="Back">
            <ArrowLeft size={16} />
          </ActionIcon>
        </Tooltip>
        <Breadcrumbs separator="/" className={classes.crumbs}>
          <Anchor component={Link} to="/app/search-visibility" size="sm" c="dimmed">
            Search visibility
          </Anchor>
          <Anchor component={Link} to={BACK_TO} size="sm" c="dimmed">
            Pages
          </Anchor>
          <Text size="sm" className={classes.crumbCurrent}>
            {isHome ? "Homepage" : path}
          </Text>
        </Breadcrumbs>
      </div>

      <div className={classes.titleRow}>
        <div className={classes.identity}>
          <span className={classes.pageIcon}>
            <Icon size={20} />
          </span>
          <div className={classes.titleText}>
            <div className={classes.titleLine}>
              <Text className={classes.title}>{isHome ? "Homepage" : path}</Text>
              <IndexStatusPill workspaceId={workspaceId} siteId={siteId} url={pageUrl} />
            </div>
            <Text className={classes.url}>{pageUrl}</Text>
          </div>
        </div>

        <div className={classes.titleActions}>
          {propertyUrl && (
            <PageFinder
              workspaceId={workspaceId}
              siteId={siteId}
              propertyUrl={propertyUrl}
              days={days}
              type={type}
              onOpen={onOpenPage}
            />
          )}
          <Select
            size="sm"
            className={classes.range}
            aria-label="Date range"
            leftSection={<CalendarDays size={14} />}
            data={RANGES.map((r) => ({ value: r.value, label: `Last ${r.label}` }))}
            value={String(days)}
            onChange={(v) => v && onDaysChange(Number(v))}
            allowDeselect={false}
          />
          <Button
            component="a"
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="default"
            rightSection={<ExternalLink size={14} />}
          >
            Open page
          </Button>
        </div>
      </div>
    </header>
  );
}
