import { createPortal } from "react-dom";
import { usePanelOverlayRoot } from "@/shared/hooks/usePanelOverlayRoot";
import { useMinimizedRun } from "@/shared/hooks/useMinimizedRun";
import { RunningPill } from "@/shared/ui/RunningPill";
import { AuditCrawlHeader } from "./AuditCrawlHeader";
import { AuditCrawlStage } from "./AuditCrawlStage";
import { useAuditProgress } from "./useAuditProgress";
import classes from "./AuditCrawl.module.css";

interface Props {
  workspaceId: string;
  siteId: string;
  url: string;
  running: boolean;
  onCancel: () => void;
}

export function AuditCrawlView({ workspaceId, siteId, url, running, onCancel }: Props) {
  const root = usePanelOverlayRoot();
  const { expanded, showPill, done, minimize, restore } = useMinimizedRun(running);
  const { phase, check } = useAuditProgress(running);
  const display = url.replace(/^https?:\/\//, "").replace(/\/$/, "") || "your page";
  const domain = display.split("/")[0];

  return (
    <>
      {root && running &&
        createPortal(
          <section className={classes.view} hidden={!expanded} aria-label="SEO audit in progress">
            <AuditCrawlHeader display={display} domain={domain} onMinimize={minimize} onCancel={onCancel} />
            <AuditCrawlStage workspaceId={workspaceId} siteId={siteId} url={url} phase={phase} check={check} />
          </section>,
          root
        )}

      {showPill && (
        <RunningPill
          done={done}
          label="Running SEO audit…"
          successMessage="SEO audit complete"
          onRestore={restore}
        />
      )}
    </>
  );
}
