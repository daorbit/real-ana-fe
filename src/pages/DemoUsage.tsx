import { useEffect, useState } from "react";
import {
  Text, Stack, Group, Card, Center, Loader, ThemeIcon, SimpleGrid,
  NumberInput, Button, Alert,
} from "@mantine/core";
import { PlayCircle, ShieldAlert, Globe2, Gauge, Check, Info } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import { useGetDemoUsageQuery, useSetDemoLimitMutation } from "../store";
import { notify, errMessage } from "../notify";
import { num, timeAgo } from "../utils";

/**
 * Admin-only: how the public demo is being used, and the knob that controls it.
 *
 * The figures are a live snapshot of the server's in-process throttle. Nothing
 * about a demo visitor is stored — no addresses, no activity log — so there is
 * no history to browse here, only the current picture.
 */
export default function DemoUsage() {
  const { data: usage, isLoading } = useGetDemoUsageQuery();
  const [setLimit, { isLoading: saving }] = useSetDemoLimitMutation();
  const [draftLimit, setDraftLimit] = useState<number | string>(3);

  // Follow the server's value until the admin edits it.
  useEffect(() => {
    if (usage?.limit) setDraftLimit(usage.limit);
  }, [usage?.limit]);

  const dirty = usage ? Number(draftLimit) !== usage.limit : false;

  const save = async () => {
    try {
      const r = await setLimit(Number(draftLimit)).unwrap();
      notify.success(
        `One address may now start ${r.limit} demo${r.limit === 1 ? "" : "s"} a day.`,
        "Limit updated"
      );
    } catch (e) {
      notify.error(errMessage(e, "Could not update the limit."));
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <PageHeader title="Demo usage" description="How the public demo is being used." />
        <Center py={64}><Loader size="sm" /></Center>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Demo usage"
        description="How often the product is being tried, and how many attempts the daily limit turns away."
      />

      <Stack gap="lg">
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
          <Stat icon={PlayCircle} label="Demos in last 24h" value={num(usage?.today ?? 0)} />
          <Stat icon={Globe2} label="Active addresses" value={num(usage?.activeIps ?? 0)} />
          <Stat
            icon={ShieldAlert}
            label="Blocked since restart"
            value={num(usage?.blockedSinceBoot ?? 0)}
            tone={(usage?.blockedSinceBoot ?? 0) > 0 ? "warn" : undefined}
          />
          <Stat icon={Gauge} label="Started since restart" value={num(usage?.startedSinceBoot ?? 0)} />
        </SimpleGrid>

        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
            <div>
              <Text fw={650} size="sm">Daily limit per address</Text>
              <Text size="xs" c="dimmed" mt={2}>
                How many demo sessions one address may start in a rolling 24
                hours. Further attempts are refused with a retry time.
              </Text>
            </div>
            <Group gap="sm" wrap="nowrap">
              <NumberInput
                value={draftLimit}
                onChange={setDraftLimit}
                min={1}
                max={1000}
                w={120}
                size="sm"
                radius="md"
                aria-label="Daily demo limit per address"
              />
              <Button
                size="sm"
                color="emerald"
                leftSection={<Check size={15} />}
                disabled={!dirty}
                loading={saving}
                onClick={save}
              >
                Save
              </Button>
            </Group>
          </Group>
        </Card>

        <Alert variant="light" color="gray" icon={<Info size={16} />} radius="md">
          <Text size="sm">
            Demo visitors are never recorded. The throttle keeps a count in the
            server's memory for 24 hours and nothing more — no addresses are
            stored, so these counters reset when the server restarts
            {usage?.since ? ` (last ${timeAgo(usage.since)})` : ""} and each
            server instance keeps its own. The limit is a deterrent, not an
            exact quota.
          </Text>
        </Alert>
      </Stack>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof PlayCircle;
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <Card withBorder radius="md" padding="md">
      <ThemeIcon size={28} radius="md" variant="light" color={tone === "warn" ? "yellow" : "gray"} mb="sm">
        <Icon size={14} />
      </ThemeIcon>
      <Text
        fz={26}
        fw={700}
        lh={1.1}
        c={tone === "warn" ? "yellow.5" : undefined}
        style={{ letterSpacing: "-0.03em", fontFamily: "var(--font-display)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </Text>
      <Text size="xs" c="dimmed" mt={2}>{label}</Text>
    </Card>
  );
}
