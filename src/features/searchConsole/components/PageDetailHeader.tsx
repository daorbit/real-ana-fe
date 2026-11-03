import { UnstyledButton } from "@mantine/core";
import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import type { SearchType } from "@/shared/types";
import { pagePath } from "../searchMetrics";
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
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  pageUrl: string;
  days: number;
  type: SearchType;
  onOpenPage: (url: string) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const path = pagePath(pageUrl);
  const title = path === "/" ? "Homepage" : path;

  const goBack = () => (location.key !== "default" ? navigate(-1) : navigate(BACK_TO));

  return (
    <header className={classes.titleRow}>
      <div className={classes.titleText}>
        <UnstyledButton className={classes.back} onClick={goBack}>
          <ChevronLeft size={14} />
          Search visibility
        </UnstyledButton>
        <div className={classes.titleLine}>
          <h1 className={classes.title}>{title}</h1>
          <IndexStatusPill workspaceId={workspaceId} siteId={siteId} url={pageUrl} />
        </div>
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className={classes.url}>
          {pageUrl}
        </a>
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
      </div>
    </header>
  );
}
