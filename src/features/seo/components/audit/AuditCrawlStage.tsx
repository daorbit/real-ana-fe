import { useRef, useState } from "react";
import { useGetSeoPreviewQuery } from "@/app/store";
import { AuditSpiders } from "./AuditSpiders";
import { useFrameAutoScroll } from "./useFrameAutoScroll";
import classes from "./AuditCrawl.module.css";

interface Props {
  workspaceId: string;
  siteId: string;
  url: string;
  phase: number;
  check: string;
}

export function AuditCrawlStage({ workspaceId, siteId, url, phase, check }: Props) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [fallbackLoaded, setFallbackLoaded] = useState(false);
  const { data, isError } = useGetSeoPreviewQuery(
    { workspaceId, siteId, url },
    { skip: !workspaceId || !siteId || !url }
  );
  const ready = useFrameAutoScroll(frame, data?.html);

  return (
    <div className={classes.stage} data-phase={phase}>
      {(data || isError) && (
        <iframe
          ref={frame}
          className={classes.frame}
          data-loaded={data ? ready : fallbackLoaded}
          srcDoc={data?.html}
          src={data ? undefined : url}
          title="Page being audited"
          sandbox={data ? "allow-same-origin" : ""}
          referrerPolicy="no-referrer"
          tabIndex={-1}
          onLoad={data ? undefined : () => setFallbackLoaded(true)}
        />
      )}
      <span className={classes.veil} />
      <span className={classes.beam} />
      <AuditSpiders check={check} />
    </div>
  );
}
