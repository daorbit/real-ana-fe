import { MetricTile } from "@/shared/ui/MetricTile";
import type { MetricChange } from "../searchMetrics";
import type { ExplainProps } from "../useSearchOrbitExplain";
import { MetricExplainButton } from "./MetricExplainButton";

export function SearchMetricTile({
  explain,
  ...props
}: {
  id: string;
  label: string;
  color: string;
  value: string;
  change: MetricChange | null;
  spark?: Record<string, number | string>[];
  sparkKey: string;
  hint: string;
  active?: boolean;
  onToggle?: () => void;
  explain?: ExplainProps;
}) {
  return <MetricTile {...props} extra={explain ? <MetricExplainButton {...explain} /> : undefined} />;
}
