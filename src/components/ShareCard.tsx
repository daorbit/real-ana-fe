import {
  Box, Group, Text, Switch, Button, CopyButton, TextInput, Tooltip, ActionIcon,
  Badge, Checkbox, SimpleGrid,
} from "@mantine/core";
import { Share2, Copy, Check, RefreshCw, ExternalLink } from "lucide-react";
import { useGetShareQuery, useSetShareMutation } from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import type { SharePanels } from "../types";

/** The panels an owner can publish, in the order they appear on the page. */
const PANELS: { key: keyof SharePanels; label: string }[] = [
  { key: "totals", label: "Headline numbers" },
  { key: "trend", label: "Traffic chart" },
  { key: "pages", label: "Top pages" },
  { key: "sources", label: "Top sources" },
  { key: "countries", label: "Countries" },
  { key: "devices", label: "Devices" },
];

/**
 * Public share link for a workspace.
 *
 * The link is unauthenticated — anyone holding it sees the numbers — so the
 * copy here says that plainly rather than burying it. Regenerating is treated
 * as a destructive action because it breaks links already sent to other
 * people, which is not obvious from the button alone.
 */
export function ShareCard({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useGetShareQuery(workspaceId);
  const [setShare, { isLoading: saving }] = useSetShareMutation();

  const enabled = data?.enabled ?? false;
  const token = data?.token ?? null;
  const url = token ? `${window.location.origin}/share/${token}` : "";

  // Default to everything on, matching the server, so the checkboxes are never
  // blank while the first request is in flight.
  const panels: SharePanels = data?.panels ?? {
    totals: true, trend: true, pages: true, sources: true, countries: true, devices: true,
  };

  const togglePanel = async (key: keyof SharePanels, next: boolean) => {
    try {
      await setShare({
        workspaceId,
        enabled,
        panels: { ...panels, [key]: next },
      }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not update what is shared."));
    }
  };

  const toggle = async (next: boolean) => {
    try {
      await setShare({ workspaceId, enabled: next }).unwrap();
      notify.success(
        next ? "Anyone with the link can now view this dashboard." : "The public link is now off.",
        next ? "Sharing on" : "Sharing off",
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not update sharing."));
    }
  };

  const rotate = () => {
    confirmDelete({
      title: "Generate a new link?",
      confirmLabel: "Generate new link",
      body: (
        <>
          The current link will stop working immediately. Anyone you have
          already sent it to will lose access until you send them the new one.
        </>
      ),
      onConfirm: async () => {
        try {
          await setShare({ workspaceId, enabled: true, rotate: true }).unwrap();
          notify.success("A new link has been generated.", "Link replaced");
        } catch (e) {
          notify.error(errMessage(e, "Could not generate a new link."));
        }
      },
    });
  };

  return (
    <Box className="surface-card" p="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap" mb={enabled ? "md" : 0}>
        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
          <Share2 size={16} className="sect-ic" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <Group gap={8}>
              <Text fw={650} size="sm">Public dashboard</Text>
              {enabled && (
                <Badge size="xs" variant="light" color="emerald" radius="sm">
                  Live
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" mt={2}>
              Share a read-only view with clients or your team — no account needed.
            </Text>
          </div>
        </Group>

        <Switch
          checked={enabled}
          onChange={(e) => toggle(e.currentTarget.checked)}
          color="emerald"
          disabled={isLoading || saving}
          aria-label="Enable public dashboard"
        />
      </Group>

      {enabled && token && (
        <>
          <Group gap="xs" wrap="nowrap">
            <TextInput
              value={url}
              readOnly
              size="sm"
              style={{ flex: 1, minWidth: 0 }}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Public dashboard link"
            />
            <CopyButton value={url}>
              {({ copied, copy }) => (
                <Button
                  size="sm"
                  variant={copied ? "light" : "default"}
                  color={copied ? "emerald" : undefined}
                  onClick={copy}
                  leftSection={copied ? <Check size={14} /> : <Copy size={14} />}
                  style={{ flexShrink: 0 }}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </CopyButton>
            <Tooltip label="Open in a new tab" withArrow>
              <ActionIcon
                component="a"
                href={url}
                target="_blank"
                rel="noreferrer"
                variant="default"
                size="lg"
                aria-label="Open public dashboard"
              >
                <ExternalLink size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>

          {/* What the viewer sees is the owner's call — page paths in
              particular can carry internal URLs they never meant to publish. */}
          <Box mt="lg" pt="md" style={{ borderTop: "1px solid var(--border)" }}>
            <Text size="xs" fw={600} mb={4}>
              What visitors can see
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              Anything turned off is never sent to the public page at all.
            </Text>

            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
              {PANELS.map((p) => (
                <Checkbox
                  key={p.key}
                  size="xs"
                  color="emerald"
                  label={p.label}
                  checked={panels[p.key]}
                  disabled={saving}
                  onChange={(e) => togglePanel(p.key, e.currentTarget.checked)}
                />
              ))}
            </SimpleGrid>
          </Box>

          <Group justify="space-between" mt="md" wrap="nowrap">
            <Text size="xs" c="dimmed">
              No site keys, settings or raw events are ever exposed.
            </Text>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              leftSection={<RefreshCw size={12} />}
              onClick={rotate}
              loading={saving}
              style={{ flexShrink: 0 }}
            >
              New link
            </Button>
          </Group>
        </>
      )}
    </Box>
  );
}
