import { useGetFieldVitalsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { SearchWebVitals } from "@/shared/types";
import { VitalsPanel } from "@/features/seo/components/VitalsPanel";
import { vitalsDeviceLabel } from "../../webVitals";
import { VitalsSkeleton } from "../SearchSkeletons";
import classes from "../searchConsole.module.css";

const VISITOR_DAYS = 30;

export function VitalsFallback({
  workspaceId,
  siteId,
  data,
}: {
  workspaceId: string;
  siteId: string;
  data: SearchWebVitals;
}) {
  const field = useGetFieldVitalsQuery({ workspaceId, siteId, days: VISITOR_DAYS });
  if (field.isLoading) return <VitalsSkeleton />;

  return (
    <>
      <section className={classes.headline} aria-label="Core Web Vitals summary">
        <p className={classes.headlineTitle}>
          {data.status === "no_data"
            ? `Google doesn't have enough Chrome visits to report on your site ${vitalsDeviceLabel(data.device)} yet.`
            : "Google's Web vitals data isn't available right now."}
        </p>
        <p className={classes.headlineSub}>
          These figures come from your own visitors instead, on every device, measured by your Quantalog snippet.
        </p>
      </section>
      {field.error ? (
        <ErrorState
          compact
          title="Couldn't load visitor vitals"
          description={errMessage(field.error, "Vitals from your visitors could not be loaded.")}
          onRetry={field.refetch}
          retrying={field.isFetching}
        />
      ) : (
        <VitalsPanel vitals={field.data} />
      )}
    </>
  );
}
