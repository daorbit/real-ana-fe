import { LEAD_STAGES, type LeadStage } from "@/features/leadCapture/types";
import { WidgetMeter } from "@/shared/ui/WidgetMeter";
import classes from "@/features/leadCapture/widgets/LeadsWidget.module.css";

const STAGE_LABEL: Record<LeadStage, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

export function LeadStageBars({ byStage, total }: { byStage: Record<LeadStage, number>; total: number }) {
  return (
    <div className={classes.stages}>
      {LEAD_STAGES.map((stage) => (
        <WidgetMeter key={stage} label={STAGE_LABEL[stage]} value={byStage[stage] ?? 0} total={total} />
      ))}
    </div>
  );
}
