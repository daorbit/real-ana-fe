import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Anchor, Badge, Button, Drawer, Group, Text } from "@mantine/core";
import { Check, Eraser, RotateCcw } from "lucide-react";
import { WIDGETS, WIDGET_GROUPS } from "@/features/analytics";
import type { WidgetId, Span } from "@/features/analytics";
import { WidgetPickerToolbar, type GroupFilter } from "@/features/analytics/components/widgetPicker/WidgetPickerToolbar";
import { WidgetPickerSections } from "@/features/analytics/components/widgetPicker/WidgetPickerSections";
import classes from "@/features/analytics/components/widgetPicker/WidgetPicker.module.css";
import drawerClasses from "@/features/analytics/components/widgetPicker/WidgetPickerDrawer.module.css";

function matchesQuery(q: string) {
  return (w: (typeof WIDGETS)[number]) =>
    !q || w.label.toLowerCase().includes(q) || w.description.toLowerCase().includes(q) || w.group.toLowerCase().includes(q);
}

export function CustomizeDrawer({
  opened,
  onClose,
  count,
  has,
  spanOf,
  toggle,
  setSpan,
  reset,
  clear,
  dirty,
  saving,
  onSave,
  title = "Customize your home page",
  intro,
  showReset = true,
}: {
  title?: string;
  intro?: ReactNode;
  showReset?: boolean;
  opened: boolean;
  onClose: () => void;
  count: number;
  has: (id: WidgetId) => boolean;
  spanOf: (id: WidgetId) => Span | undefined;
  toggle: (id: WidgetId) => void;
  setSpan: (id: WidgetId, span: Span) => void;
  reset: () => void;
  clear: () => void;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<GroupFilter>("All");

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = WIDGETS.filter(matchesQuery(q));
    return WIDGET_GROUPS.filter((g) => group === "All" || g === group)
      .map((g) => ({ group: g, items: matches.filter((w) => w.group === g) }))
      .filter((s) => s.items.length > 0);
  }, [query, group]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={860}
      radius="lg"
      classNames={{ header: drawerClasses.header, title: drawerClasses.title, body: drawerClasses.body }}
      title={
        <Group justify="space-between" wrap="nowrap" w="100%">
          <Group gap="sm" wrap="nowrap">
            <Text fw={650}>{title}</Text>
            <Badge variant="light" size="sm">{count} on your page</Badge>
          </Group>
          {dirty && (
            <Button size="xs" leftSection={<Check size={14} />} onClick={onSave} loading={saving}>
              Save changes
            </Button>
          )}
        </Group>
      }
    >
      <Text size="sm" c="dimmed" mb="sm">
        {intro ?? (
          <>
            Previews use sample data. Your real numbers show once a widget is on the page. The full breakdown lives in{" "}
            <Anchor component={Link} to="/app/analytics" size="sm">Website analytics</Anchor>.
          </>
        )}
      </Text>

      <WidgetPickerToolbar query={query} onQuery={setQuery} group={group} onGroup={setGroup} has={has} />

      {opened && (
        <WidgetPickerSections
          sections={sections}
          query={query}
          onClearQuery={() => setQuery("")}
          has={has}
          spanOf={spanOf}
          toggle={toggle}
          setSpan={setSpan}
        />
      )}

      <div className={classes.footer}>
        <Button variant="subtle" color="gray" size="xs" leftSection={<Eraser size={13} />} onClick={clear}>
          Clear all
        </Button>
        {showReset && (
          <Button variant="default" size="xs" leftSection={<RotateCcw size={13} />} onClick={reset}>
            Reset to default
          </Button>
        )}
      </div>
    </Drawer>
  );
}
