import { Badge } from "@mantine/core";
import { STATUS_COLOR, STATUS_LABEL } from "@/features/experiments/lib/experimentLabels";
import type { ExperimentStatus } from "@/features/experiments/types";

export function ExperimentStatusBadge({ status }: { status: ExperimentStatus }) {
  return (
    <Badge variant="light" color={STATUS_COLOR[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
