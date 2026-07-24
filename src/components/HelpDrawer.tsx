import { useEffect, useRef, useState } from "react";
import {
  Drawer, Box, Group, Text, ScrollArea, UnstyledButton, ThemeIcon, Divider, Badge,
} from "@mantine/core";
import { LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** One explained thing inside a section — the "tooltip", spelled out. */
export type HelpItem = {
  term: string;
  detail: string;
  /** Optional tag shown next to the term, e.g. "critical" or "beta". */
  tag?: string;
};

/** One section of the help tree — a tab, or a group of widgets. */
export type HelpSection = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** One or two sentences on what this tab/area is for. */
  blurb: string;
  items: HelpItem[];
};

/**
 * A reusable, right-side help drawer with a nav list on the left and a content
 * pane on the right.
 *
 * It is "context aware": open it with `initialId` set to the section the user
 * was looking at (the SEO tab they're on, say) and it selects that section
 * first, so the relevant help is already on screen. The nav list still lets
 * them wander to any other section.
 */
export function HelpDrawer({
  opened,
  onClose,
  title = "Help",
  sections,
  initialId,
}: {
  opened: boolean;
  onClose: () => void;
  title?: string;
  sections: HelpSection[];
  /** Section to show first. Falls back to the first section. */
  initialId?: string;
}) {
  const [activeId, setActiveId] = useState(initialId ?? sections[0]?.id);
  const paneRef = useRef<HTMLDivElement>(null);

  // Re-sync to the caller's context every time the drawer is (re)opened — the
  // user may have switched tabs since it last closed.
  useEffect(() => {
    if (opened && initialId) setActiveId(initialId);
  }, [opened, initialId]);

  // Reset the content pane's scroll when the section changes, so a long section
  // doesn't leave the next one scrolled halfway down.
  useEffect(() => {
    paneRef.current?.scrollTo({ top: 0 });
  }, [activeId]);

  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      padding={0}
      radius={0}
      withCloseButton={false}
      title={null}
      styles={{ body: { height: "100%", padding: 0 } }}
    >
      <Box className="help-drawer">
        <Group className="help-drawer-head" justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon size={32} radius="md" variant="light" color="emerald">
              <LifeBuoy size={17} />
            </ThemeIcon>
            <div>
              <Text fw={650} size="sm">{title}</Text>
              <Text size="xs" c="dimmed">What each part of this page does.</Text>
            </div>
          </Group>
          <UnstyledButton className="help-drawer-close" onClick={onClose} aria-label="Close help">
            ✕
          </UnstyledButton>
        </Group>

        <Box className="help-drawer-body">
          {/* Left: section nav. */}
          <Box className="help-nav">
            {sections.map((s) => {
              const Icon = s.icon;
              const on = s.id === active?.id;
              return (
                <UnstyledButton
                  key={s.id}
                  className="help-nav-item"
                  data-active={on || undefined}
                  onClick={() => setActiveId(s.id)}
                >
                  <Icon size={15} className="help-nav-ic" />
                  <Text size="sm" fw={on ? 600 : 500} truncate>{s.label}</Text>
                </UnstyledButton>
              );
            })}
          </Box>

          {/* Right: content of the selected section. */}
          <ScrollArea className="help-pane" viewportRef={paneRef}>
            {active && (
              <Box p="lg">
                <Group gap="sm" mb="xs" wrap="nowrap">
                  <ThemeIcon size={30} radius="md" variant="light" color="gray">
                    <active.icon size={16} />
                  </ThemeIcon>
                  <Text fw={700} fz="lg" style={{ letterSpacing: "-0.01em" }}>{active.label}</Text>
                </Group>
                <Text size="sm" c="dimmed" lh={1.6} mb="lg">{active.blurb}</Text>
                <Divider mb="lg" />
                <Box className="help-items">
                  {active.items.map((it, i) => (
                    <Box key={i} className="help-item">
                      <Group gap={8} mb={4} wrap="wrap">
                        <Text size="sm" fw={600}>{it.term}</Text>
                        {it.tag && (
                          <Badge size="xs" variant="light" color="gray" radius="sm">{it.tag}</Badge>
                        )}
                      </Group>
                      <Text size="sm" c="dimmed" lh={1.6}>{it.detail}</Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </ScrollArea>
        </Box>
      </Box>
    </Drawer>
  );
}
