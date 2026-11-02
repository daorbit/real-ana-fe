import { Fragment, useMemo, type CSSProperties } from "react";
import { ArrowRight, Inbox } from "lucide-react";
import { useGetUserFlowQuery } from "@/app/store";
import { num } from "@/shared/lib";
import { FlowGraphSkeleton } from "@/shared/ui/Skeletons";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { flowColumns } from "@/features/analytics/lib/flowColumns";
import classes from "./UserFlow.module.css";

export function UserFlowPanel({
  workspaceId,
  range,
  sites,
  onSelectPath,
}: {
  workspaceId: string;
  range: string;
  sites?: string[];
  onSelectPath?: (path: string) => void;
}) {
  const { data, isFetching } = useGetUserFlowQuery({ workspaceId, range, sites });
  const columns = useMemo(() => flowColumns(data?.nodes ?? [], data?.edges ?? []), [data]);

  return (
    <RankCard
      title="User flow"
      subtitle="The three most common steps after each page. Click a page to filter by it."
      tone="blue"
      fill={false}
    >
      {isFetching ? (
        <FlowGraphSkeleton />
      ) : columns.length === 0 ? (
        <RankEmpty icon={Inbox}>Waiting for enough sessions to show how visitors move between pages.</RankEmpty>
      ) : (
        <div className={classes.scroll}>
          <div className={classes.flow}>
            {columns.map((col, ci) => (
              <Fragment key={col.title}>
                <div className={classes.column}>
                  <div className={classes.head}>
                    <span className={classes.title}>{col.title}</span>
                    {col.continuePct !== null && <span className={classes.cont}>{col.continuePct}% go on</span>}
                  </div>
                  {col.nodes.map((n) => (
                    <button
                      key={n.path}
                      type="button"
                      className={classes.node}
                      title={onSelectPath ? `Filter by ${n.path}` : n.path}
                      onClick={onSelectPath ? () => onSelectPath(n.path) : undefined}
                      disabled={!onSelectPath}
                    >
                      <span className={classes.path}>{n.path}</span>
                      <span className={classes.figures}>
                        <span className={classes.sessions}>{num(n.sessions)}</span>
                        <span className={classes.leave}>{n.leavePct}% leave</span>
                      </span>
                      <span className={classes.track} aria-hidden>
                        <span className={classes.bar} style={{ "--share": `${n.share}%` } as CSSProperties} />
                      </span>
                    </button>
                  ))}
                </div>
                {ci < columns.length - 1 && (
                  <div className={classes.arrow} aria-hidden>
                    <ArrowRight size={18} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </RankCard>
  );
}
