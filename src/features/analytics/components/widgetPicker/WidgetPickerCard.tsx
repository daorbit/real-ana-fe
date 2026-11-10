import { lazy, Suspense, useEffect, useState } from "react";
import { Button, SegmentedControl, UnstyledButton } from "@mantine/core";
import { useInViewport } from "@mantine/hooks";
import { Check, Plus, X } from "lucide-react";
import { ChartSkeleton } from "@/shared/ui/Skeletons";
import type { Span, Widget, WidgetId } from "@/features/analytics/widgetCatalog";
import classes from "@/features/analytics/components/widgetPicker/WidgetPicker.module.css";

const WidgetPreviewFrame = lazy(() => import("@/features/analytics/components/widgetPicker/WidgetPreviewFrame"));

const SPANS: Span[] = [1, 2, 3, 4];

function Preview({ id }: { id: WidgetId }) {
  const { ref, inViewport } = useInViewport();
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inViewport) setSeen(true);
  }, [inViewport]);
  return (
    <div ref={ref} className={classes.preview}>
      {seen && (
        <Suspense fallback={<ChartSkeleton height={120} bare />}>
          <WidgetPreviewFrame id={id} />
        </Suspense>
      )}
    </div>
  );
}

export function WidgetPickerCard({
  widget,
  active,
  span,
  onToggle,
  onSpan,
}: {
  widget: Widget;
  active: boolean;
  span: Span;
  onToggle: () => void;
  onSpan: (span: Span) => void;
}) {
  const id = widget.id as WidgetId;
  return (
    <div className={classes.card} data-active={active || undefined}>
      <UnstyledButton className={classes.previewButton} onClick={onToggle} aria-label={`${active ? "Remove" : "Add"} ${widget.label}`}>
        <Preview id={id} />
      </UnstyledButton>
      <div className={classes.meta}>
        <div className={classes.text}>
          <span className={classes.name}>{widget.label}</span>
          <span className={classes.desc}>{widget.description}</span>
        </div>
        {active ? (
          <Button size="xs" variant="subtle" color="gray" leftSection={<X size={13} />} onClick={onToggle}>
            Remove
          </Button>
        ) : (
          <Button size="xs" variant="default" leftSection={<Plus size={13} />} onClick={onToggle}>
            Add
          </Button>
        )}
      </div>
      {active && (
        <div className={classes.widthRow}>
          <span className={classes.added}>
            <Check size={13} />
            On your page
          </span>
          <span className={classes.spacer} />
          <span className={classes.widthLabel}>Width</span>
          <SegmentedControl
            size="xs"
            value={String(span)}
            onChange={(v) => onSpan(Number(v) as Span)}
            data={SPANS.map((s) => ({ label: String(s), value: String(s) }))}
          />
        </div>
      )}
    </div>
  );
}
