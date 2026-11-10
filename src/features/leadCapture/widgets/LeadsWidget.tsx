import { useMemo } from "react";
import { Inbox } from "lucide-react";
import { useDemo } from "@/features/demo/context";
import { demoLeadPipeline } from "@/features/demo/demoLeads";
import { useDemoTick } from "@/features/demo/useDemoTick";
import { usePermissions } from "@/features/workspace/context";
import { HomeWidgetCard, WidgetEmpty, WidgetList, WidgetRow, WidgetStat, WidgetStats } from "@/shared/ui/HomeWidgetCard";
import { ChartSkeleton } from "@/shared/ui/Skeletons";
import { num, share } from "@/shared/lib";
import { useGetLeadPipelineQuery } from "@/features/leadCapture/api";
import { LeadStageBars } from "@/features/leadCapture/widgets/LeadStageBars";

const TOP_FORMS = 3;

export function LeadsWidget({ workspaceId }: { workspaceId: string }) {
  const { demo } = useDemo();
  const { canEdit } = usePermissions();
  const tick = useDemoTick(demo);
  const sample = useMemo(() => (demo && tick >= 0 ? demoLeadPipeline() : null), [demo, tick]);
  const { currentData, isLoading, isError } = useGetLeadPipelineQuery(workspaceId, { skip: demo || !canEdit });
  const data = sample ?? currentData;

  return (
    <HomeWidgetCard icon={Inbox} title="Leads" meta="Last 30 days" to="/app/lead-capture">
      {!demo && !canEdit ? (
        <WidgetEmpty>Editors and admins can see leads here.</WidgetEmpty>
      ) : isLoading && !data ? (
        <ChartSkeleton height={140} />
      ) : isError || !data ? (
        <WidgetEmpty>Leads couldn't load right now.</WidgetEmpty>
      ) : data.total === 0 ? (
        <WidgetEmpty>New form responses show up here.</WidgetEmpty>
      ) : (
        <>
          <WidgetStats>
            <WidgetStat label="New leads" value={num(data.total)} />
            <WidgetStat label="Won" value={num(data.byStage.won)} tone="good" />
            <WidgetStat label="Win rate" value={share(data.byStage.won, data.total)} />
          </WidgetStats>
          <LeadStageBars byStage={data.byStage} total={data.total} />
          <WidgetList>
            {data.topForms.slice(0, TOP_FORMS).map((form) => (
              <WidgetRow key={form.formId} title={form.name || "Untitled form"} sub="Form" end={num(form.leads)} />
            ))}
          </WidgetList>
        </>
      )}
    </HomeWidgetCard>
  );
}
