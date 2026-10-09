import { SegmentedControl } from "@mantine/core";
import classes from "./Compare.module.css";

export type SectionId = "plan" | "checks" | "gaps" | "serp";

export type SectionItem = { id: SectionId; label: string; count?: number; alarm?: boolean };

export function DetailSections({
  items,
  value,
  onChange,
}: {
  items: SectionItem[];
  value: SectionId;
  onChange: (id: SectionId) => void;
}) {
  return (
    <div className={classes.sectionNav}>
      <SegmentedControl
        fullWidth
        radius="md"
        size="sm"
        value={value}
        onChange={(v) => onChange(v as SectionId)}
        classNames={{ root: `${classes.segRoot} glass`, indicator: classes.segIndicator }}
        data={items.map((item) => ({
          value: item.id,
          label: (
            <span className={classes.segLabel}>
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className={classes.segCount} data-alarm={item.alarm || undefined}>
                  {item.count}
                </span>
              )}
            </span>
          ),
        }))}
      />
    </div>
  );
}
