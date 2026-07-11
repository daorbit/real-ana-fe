import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Drawer, Text, Stack, Group, Button, Checkbox, Card, Badge, Divider, Anchor,
  ScrollArea, TextInput, SimpleGrid, Center, ThemeIcon,
} from "@mantine/core";
import { motion } from "framer-motion";
import { RotateCcw, Eraser, Search, SearchX, X } from "lucide-react";
import { WIDGETS, WIDGET_GROUPS } from "../hooks";
import type { WidgetId } from "../hooks";
import { WidgetPreview } from "./WidgetPreview";

export function CustomizeDrawer({
  opened,
  onClose,
  count,
  has,
  toggle,
  reset,
  clear,
}: {
  opened: boolean;
  onClose: () => void;
  /** How many widgets are currently on the home page. */
  count: number;
  has: (id: WidgetId) => boolean;
  toggle: (id: WidgetId) => void;
  reset: () => void;
  clear: () => void;
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WIDGETS;
    return WIDGETS.filter(
      (w) =>
        w.label.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.group.toLowerCase().includes(q)
    );
  }, [query]);

  const groups = WIDGET_GROUPS.map((group) => ({
    group,
    items: matches.filter((w) => w.group === group),
    total: WIDGETS.filter((w) => w.group === group).length,
  })).filter((g) => g.items.length > 0);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="xl"
      radius="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group gap="sm">
          <Text fw={650}>Customize your home page</Text>
          <Badge variant="light" color="emerald" size="sm">{count} on your page</Badge>
        </Group>
      }
    >
      <Text size="sm" c="dimmed" mb="md">
        Pick any widget from Analytics to pin here. The complete breakdown always lives in{" "}
        <Anchor component={Link} to="/app/analytics" size="sm">Analytics</Anchor>.
      </Text>

      <TextInput
        placeholder="Search widgets…"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        leftSection={<Search size={15} />}
        rightSection={
          query ? (
            <X
              size={15}
              style={{ cursor: "pointer" }}
              onClick={() => setQuery("")}
            />
          ) : null
        }
        mb="lg"
      />

      {groups.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap={6}>
            <ThemeIcon variant="light" color="gray" size="xl" radius="md"><SearchX size={20} /></ThemeIcon>
            <Text fw={600} size="sm">No widgets match “{query}”</Text>
            <Button size="xs" variant="subtle" onClick={() => setQuery("")}>Clear search</Button>
          </Stack>
        </Center>
      ) : (
        <Stack gap="xl">
          {groups.map(({ group, items, total }) => {
            const on = items.filter((w) => has(w.id)).length;
            return (
              <div key={group}>
                <Group justify="space-between" mb="sm">
                  <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
                    {group}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {query ? `${items.length} of ${total}` : `${on}/${total}`}
                  </Text>
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                  {items.map((w, i) => {
                    const active = has(w.id);
                    return (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i, 8) * 0.03, duration: 0.22 }}
                      >
                        <Card
                          withBorder
                          radius="md"
                          padding="sm"
                          h="100%"
                          className={active ? "widget-pick active" : "widget-pick"}
                          onClick={() => toggle(w.id)}
                        >
                          <Group justify="space-between" wrap="nowrap" mb="xs">
                            <Text fw={600} size="sm" truncate>{w.label}</Text>
                            <Checkbox
                              checked={active}
                              onChange={() => toggle(w.id)}
                              onClick={(e) => e.stopPropagation()}
                              color="emerald"
                              radius="sm"
                              size="sm"
                            />
                          </Group>

                          <WidgetPreview kind={w.kind} active={active} />

                          <Text size="xs" c="dimmed" mt="xs" lineClamp={2}>
                            {w.description}
                          </Text>
                        </Card>
                      </motion.div>
                    );
                  })}
                </SimpleGrid>
              </div>
            );
          })}
        </Stack>
      )}

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
