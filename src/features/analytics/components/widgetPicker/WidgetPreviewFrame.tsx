import { DemoPreviewScope } from "@/features/demo/context";
import { useWorkspace } from "@/features/workspace/context";
import { WidgetRenderer } from "@/features/analytics/components/widgets/WidgetRenderer";
import { usePreviewData } from "@/features/analytics/components/widgetPicker/usePreviewData";
import type { WidgetId } from "@/features/analytics/widgetCatalog";
import classes from "@/features/analytics/components/widgetPicker/WidgetPicker.module.css";

export default function WidgetPreviewFrame({ id }: { id: WidgetId }) {
  const data = usePreviewData(useWorkspace().active?._id);
  return (
    <DemoPreviewScope>
      <div className={`${classes.previewInner} an-report`} inert>
        <WidgetRenderer id={id} data={data} />
      </div>
    </DemoPreviewScope>
  );
}
