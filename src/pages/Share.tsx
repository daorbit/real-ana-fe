import {
  Text, Group, Button, Switch, TextInput, CopyButton, Tooltip, ActionIcon,
  Badge, Checkbox, SimpleGrid, Stack, Box, Center, ThemeIcon, Alert, Skeleton,
  Divider,
} from "@mantine/core";
import {
  Share2, Copy, Check, RefreshCw, ExternalLink, Eye, ShieldCheck, Link2Off,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader, Section, Field, PageStack } from "../components/Page";
import { useGetShareQuery, useSetShareMutation } from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import { num, timeAgo } from "../utils";
import type { SharePanels } from "../types";

type PanelDef = { key: keyof SharePanels; label: string; hint: string };

/**
 * The panels an owner can publish, grouped the way they'd be reasoned about
 * rather than the order they happen to appear on the public page.
 */
const PANEL_GROUPS: { heading: string; note?: string; panels: PanelDef[] }[] = [
  {
    heading: "Overview",
    panels: [
      { key: "totals", label: "Headline numbers", hint: "Visitors, pageviews, live" },
      { key: "trend", label: "Traffic chart", hint: "Views over the range" },
      { key: "engagement", label: "Engagement", hint: "Bounce rate, session length" },
      { key: "visitorSplit", label: "New vs returning", hint: "First-time and repeat" },
    ],
  },
  {
    heading: "Content",
    note: "Page paths can carry internal URLs you never meant to publish.",
    panels: [
      { key: "pages", label: "Top pages", hint: "Most visited paths" },
      { key: "entryPages", label: "Entry pages", hint: "Where sessions start" },
      { key: "exitPages", label: "Exit pages", hint: "Where sessions end" },
    ],
  },
  {
    heading: "Acquisition",
    panels: [
      { key: "sources", label: "Top sources", hint: "Referring sites" },
      { key: "channels", label: "Channels", hint: "Organic, paid, social, direct" },
    ],
  },
  {
    heading: "Audience",
    panels: [
      { key: "countries", label: "Countries", hint: "Visitors by country" },
      { key: "languages", label: "Languages", hint: "Browser language" },
      { key: "devices", label: "Devices", hint: "Desktop, mobile, tablet" },
      { key: "browsers", label: "Browsers", hint: "Chrome, Safari, Firefox" },
      { key: "operatingSystems", label: "Operating systems", hint: "Windows, macOS, iOS" },
    ],
  },
];

const ALL_PANELS = PANEL_GROUPS.flatMap((g) => g.panels);

/**
 * Mirrors the server defaults for a workspace that has never been configured.
 * Panels added after launch start off — an existing public link must not begin
 * publishing new breakdowns without the owner turning them on.
 */
const DEFAULT_PANELS: SharePanels = {
  totals: true, trend: true, pages: true, sources: true, countries: true, devices: true,
  browsers: false, operatingSystems: false, entryPages: false, exitPages: false,
  languages: false, channels: false, engagement: false, visitorSplit: false,
};

/**
 * Public dashboard settings for the active workspace.
 *
 * The link is unauthenticated — anyone holding it sees the numbers — so the
 * copy says that plainly rather than burying it, and rotating is treated as
 * destructive because it silently breaks links already sent to other people.
 */
function ShareSettings({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading } = useGetShareQuery(workspaceId);
  const [setShare, { isLoading: saving }] = useSetShareMutation();

  const enabled = data?.enabled ?? false;
  const token = data?.token ?? null;
  const views = data?.views ?? 0;
  const url = token ? `${window.location.origin}/share/${token}` : "";

  // Default to everything on, matching the server, so the checkboxes are never
  // blank while the first request is in flight.
  const panels = { ...DEFAULT_PANELS, ...(data?.panels ?? {}) };
  const onCount = ALL_PANELS.filter((p) => panels[p.key]).length;

  const writePanels = async (next: SharePanels, failMessage: string) => {
    try {
      await setShare({ workspaceId, enabled, panels: next }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, failMessage));
    }
  };

  const togglePanel = (key: keyof SharePanels, next: boolean) =>
    writePanels({ ...panels, [key]: next }, "Could not update what is shared.");

  const setAll = (next: boolean) =>
    writePanels(
      Object.fromEntries(ALL_PANELS.map((p) => [p.key, next])) as SharePanels,
      "Could not update what is shared.",
    );

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

  if (isLoading) {
    return (
      <PageStack maxWidth={1080}>
        <Skeleton height={132} radius="lg" />
        <Skeleton height={180} radius="lg" />
      </PageStack>
    );
  }

  return (
    <PageStack maxWidth={1080}>
      <Section
        title="Public link"
        description="Share a read-only view with clients or your team — no account needed."
      >
        <Field
          label="Public dashboard"
          hint={
            enabled
              ? "Live. Anyone with the link can view these numbers."
              : "Off. The link returns 404 until you turn this on."
          }
          last={!enabled}
        >
          <Group justify="flex-end" gap="sm" wrap="nowrap">
            {enabled && (
              <Badge size="sm" variant="light" color="emerald" radius="sm">
                Live
              </Badge>
            )}
            <Switch
              checked={enabled}
              onChange={(e) => toggle(e.currentTarget.checked)}
              color="emerald"
              disabled={saving}
              aria-label="Enable public dashboard"
            />
          </Group>
        </Field>

        {enabled && token && (
          <>
            {/* The link gets a full-width row of its own rather than a Field:
                a share URL is long, and a truncated one can't be read back to
                check it before sending. */}
            <Box px="lg" py="md">
              <Text size="sm" fw={500}>Link</Text>
              <Text size="xs" c="dimmed" mt={3} mb="sm">
                Treat this like a password — the token is the only credential.
              </Text>
              <Group gap="xs" wrap="nowrap">
                <TextInput
                  value={url}
                  readOnly
                  size="sm"
                  style={{ flex: 1, minWidth: 0 }}
                  styles={{ input: { fontFamily: "var(--mono, monospace)", fontSize: 13 } }}
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
            </Box>
            <Divider />

            <Field
              label="Replace the link"
              hint="Use this if the current link reached someone it shouldn't have."
              last
            >
              <Group justify="flex-end">
                <Button
                  size="sm"
                  variant="default"
                  leftSection={<RefreshCw size={14} />}
                  onClick={rotate}
                  loading={saving}
                >
                  New link
                </Button>
              </Group>
            </Field>
          </>
        )}
      </Section>

      {enabled && token && (
        <>
          {/* What the viewer sees is the owner's call — page paths in particular
              can carry internal URLs they never meant to publish. */}
          <Section
            title="What visitors can see"
            description="Anything turned off is never sent to the public page at all."
            actions={
              <Group gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {onCount} of {ALL_PANELS.length} on
                </Text>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  disabled={saving || onCount === ALL_PANELS.length}
                  onClick={() => setAll(true)}
                >
                  All
                </Button>
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="gray"
                  disabled={saving || onCount === 0}
                  onClick={() => setAll(false)}
                >
                  None
                </Button>
              </Group>
            }
          >
            <Stack gap={0}>
              {PANEL_GROUPS.map((g, i) => (
                <Box key={g.heading}>
                  {i > 0 && <Divider />}
                  <Box p="lg">
                    <Text size="xs" fw={650} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.04em" }}>
                      {g.heading}
                    </Text>
                    {g.note && (
                      <Text size="xs" c="dimmed" mt={4}>
                        {g.note}
                      </Text>
                    )}
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md" mt="md">
                      {g.panels.map((p) => (
                        <Checkbox
                          key={p.key}
                          size="sm"
                          color="emerald"
                          label={p.label}
                          description={p.hint}
                          checked={panels[p.key]}
                          disabled={saving}
                          onChange={(e) => togglePanel(p.key, e.currentTarget.checked)}
                        />
                      ))}
                    </SimpleGrid>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Section>

          <Section title="Activity" description="How often the public link has been opened.">
            <Box p="lg">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="emerald" radius="md" size="lg">
                  <Eye size={17} />
                </ThemeIcon>
                <div>
                  <Text fw={650}>
                    {num(views)} {views === 1 ? "open" : "opens"}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {data?.lastViewedAt
                      ? `Last opened ${timeAgo(data.lastViewedAt)}. Resets when you replace the link.`
                      : "Not opened yet. Resets when you replace the link."}
                  </Text>
                </div>
              </Group>
            </Box>
          </Section>
        </>
      )}

      <Alert
        variant="light"
        color="gray"
        icon={<ShieldCheck size={16} />}
        title="What is never shared"
      >
        <Text size="sm">
          Site keys, workspace settings, team members and raw events stay
          private. The public page is read-only and cannot send events.
        </Text>
      </Alert>
    </PageStack>
  );
}

/** Shown when there is no workspace to configure sharing for. */
function NoWorkspace() {
  return (
    <Center py={64}>
      <Stack align="center" gap={8} maw={380}>
        <ThemeIcon variant="light" color="gray" size={48} radius="md">
          <Link2Off size={22} />
        </ThemeIcon>
        <Text fw={650} mt={4}>No workspace selected</Text>
        <Text c="dimmed" size="sm" ta="center">
          Public dashboards are published per workspace. Create or pick one
          first, then come back here to share it.
        </Text>
        <Button component="a" href="/app/workspaces" variant="light" mt="sm">
          Go to workspaces
        </Button>
      </Stack>
    </Center>
  );
}

export default function Share() {
  const { active } = useWorkspace();

  return (
    <AppShell>
      <PageHeader
        title="Public dashboard"
        description="Publish a read-only view of this workspace at a link anyone can open."
        actions={
          <Badge
            variant="light"
            color="gray"
            radius="sm"
            leftSection={<Share2 size={12} />}
          >
            {active?.name ?? "No workspace"}
          </Badge>
        }
      />
      {active ? <ShareSettings key={active._id} workspaceId={active._id} /> : <NoWorkspace />}
    </AppShell>
  );
}
