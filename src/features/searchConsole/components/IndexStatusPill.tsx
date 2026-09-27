import { Skeleton } from "@mantine/core";
import { useGetSearchInspectionQuery } from "@/app/store";
import { verdictOf } from "../inspectionVerdict";
import { useSearchEntitlements } from "../useSearchEntitlements";
import classes from "./pageDetail.module.css";

export function IndexStatusPill({ workspaceId, siteId, url }: { workspaceId: string; siteId: string; url: string }) {
  const { canInspect } = useSearchEntitlements();
  const { data, isLoading } = useGetSearchInspectionQuery({ workspaceId, siteId, url }, { skip: !canInspect });

  if (isLoading) return <Skeleton height={24} width={104} radius="xl" />;
  if (!data) return null;

  const verdict = verdictOf(data);
  const Icon = verdict.icon;
  return (
    <span className={classes.pill} data-tone={verdict.tone}>
      <Icon size={13} />
      {verdict.short}
    </span>
  );
}
