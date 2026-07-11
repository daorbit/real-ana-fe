import { Link } from "react-router-dom";
import {
  Drawer, Text, Stack, Group, Button, Checkbox, Card, Badge, Divider, Anchor, ScrollArea,
} from "@mantine/core";
import { motion } from "framer-motion";
import { RotateCcw, Eraser } from "lucide-react";
import { WIDGETS, WIDGET_GROUPS } from "../hooks";
import type { WidgetId } from "../hooks";
import { WidgetPreview } from "./WidgetPreview";

export function CustomizeDrawer({
  opened,
  onClose,
  enabled,
  has,
  toggle,
  reset,
  clear,
}: {
  opened: boolean;
  onClose: () => void;
  enabled: WidgetId[];
  has: (id: WidgetId) => boolean;
  toggle: (id: WidgetId) => void;
  reset: () => void;
  clear: () => void;
}) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      radius="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group gap="sm">
          <Text fw={650}>Customize your home page</Text>
          <Badge variant="light" color="emerald" size="sm">{enabled.length} selected</Badge>
        </Group>
      }
    >
      <Text size="sm" c="dimmed" mb="lg">
        Pick any widget from Analytics to pin here. The complete breakdown always lives in{" "}
        <Anchor component={Link} to="/app/analytics" size="sm">Analytics</Anchor>.
      </Text>

      <Stack gap="xl">
        {WIDGET_GROUPS.map((group) => {
          const items = WIDGETS.filter((w) => w.group === group);
          const on = items.filter((w) => has(w.id)).length;

          return (
            <div key={group}>
              <Group justify="space-between" mb="sm">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                  {group}
                </Text>
                <Text size="xs" c="dimmed">{on}/{items.length}</Text>
              </Group>

              <Stack gap="sm">
                {items.map((w, i) => {
                  const active = has(w.id);
                  return (
                    <motion.div
                      key={w.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                    >
                      <Card
                        withBorder
                        radius="md"
                        padding="sm"
                        className={active ? "widget-pick active" : "widget-pick"}
                        onClick={() => toggle(w.id)}
                      >
                        <Group gap="md" wrap="nowrap" align="center">
                          <Checkbox
                            checked={active}
                            onChange={() => toggle(w.id)}
                            onClick={(e) => e.stopPropagation()}
                            color="emerald"
                            radius="sm"
                          />

                          <WidgetPreview kind={w.kind} active={active} />

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text fw={600} size="sm" truncate>{w.label}</Text>
                            <Text size="xs" c="dimmed" truncate>{w.description}</Text>
                          </div>
                        </Group>
                      </Card>
                    </motion.div>
                  );
                })}
              </Stack>
            </div>
          );
        })}
      </Stack>

      <Divider my="lg" />
      <Group justify="space-between">
        <Button variant="subtle" color="gray" size="xs" leftSection={<Eraser size={13} />} onClick={clear}>
          Clear all
        </Button>
        <Button variant="light" size="xs" leftSection={<RotateCcw size={13} />} onClick={reset}>
          Reset to default
        </Button>
      </Group>
    </Drawer>
  );
}
