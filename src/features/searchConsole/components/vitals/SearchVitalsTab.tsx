import { useMemo, useState } from "react";
import { useGetSearchWebVitalsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useDemo } from "@/features/demo/context";
import { demoSearchWebVitals } from "@/features/demo/demoSearchVitals";
import type { SearchVitalsDevice } from "@/shared/types";
import { SearchSegmented } from "../SearchSegmented";
import { VitalsSkeleton } from "../SearchSkeletons";
import { VitalsHeadline } from "./VitalsHeadline";
import { VitalCards } from "./VitalCards";
import { VitalTrendCard } from "./VitalTrendCard";
import { VitalPagesTable } from "./VitalPagesTable";
import { VitalsFallback } from "./VitalsFallback";
import classes from "../searchConsole.module.css";

const DEVICES: { value: SearchVitalsDevice; label: string }[] = [
  { value: "mobile", label: "Mobile" },
  { value: "desktop", label: "Desktop" },
  { value: "all", label: "All devices" },
];

export function SearchVitalsTab({
  workspaceId,
  siteId,
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  onOpenPage: (url: string) => void;
}) {
  const [device, setDevice] = useState<SearchVitalsDevice>("mobile");
  const { demo } = useDemo();
  const real = useGetSearchWebVitalsQuery({ workspaceId, siteId, device }, { skip: demo });
  const sample = useMemo(() => (demo ? demoSearchWebVitals(device) : null), [demo, device]);
  const data = sample ?? real.currentData;

  const body = data ? (
    data.status === "ready" ? (
      <>
        <VitalsHeadline data={data} />
        <VitalCards data={data} />
        <VitalTrendCard data={data} />
        <VitalPagesTable workspaceId={workspaceId} siteId={siteId} device={device} onOpenPage={onOpenPage} />
      </>
    ) : (
      <VitalsFallback workspaceId={workspaceId} siteId={siteId} data={data} />
    )
  ) : real.error && !real.isFetching ? (
    <ErrorState
      compact
      title="Couldn't load Web vitals"
      description={errMessage(real.error, "Web vitals could not be loaded from Google.")}
      onRetry={real.refetch}
      retrying={real.isFetching}
    />
  ) : (
    <VitalsSkeleton />
  );

  return (
    <div className={classes.section}>
      <SearchSegmented items={DEVICES} value={device} onChange={setDevice} label="Device" size="sm" />
      {body}
    </div>
  );
}
