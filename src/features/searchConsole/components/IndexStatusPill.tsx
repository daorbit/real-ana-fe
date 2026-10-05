import { useMemo } from "react";
import { Skeleton } from "@mantine/core";
import { useGetSearchInspectionQuery } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { demoSearchInspection } from "@/features/demo/demoSearchConsole";
import { verdictOf } from "../inspectionVerdict";
import { useSearchEntitlements } from "../useSearchEntitlements";
import classes from "./pageDetail.module.css";

export function IndexStatusPill({ workspaceId, siteId, url }: { workspaceId: string; siteId: string; url: string }) {
  const { canInspect } = useSearchEntitlements();
  const real = useGetSearchInspectionQuery({ workspaceId, siteId, url }, { skip: !canInspect });
  const { demo } = useDemo();
  const sample = useMemo(() => (demo && canInspect ? demoSearchInspection(url) : null), [demo, canInspect, url]);
  const data = sample ?? real.data;
  const isLoading = sample ? false : real.isLoading;

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
