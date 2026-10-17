import { useEffect, useState } from "react";
import { Alert, Button, Card, Center, Group, Loader, NumberInput, SimpleGrid, Stack, Text } from "@mantine/core";
import { Check, Globe2, Info, PlayCircle, ShieldAlert } from "lucide-react";
import { useGetDemoUsageQuery, useSetDemoLimitMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { num, timeAgo } from "@/shared/lib";
import { AdminSection } from "../layout/AdminSection";
import { AdminRefreshButton } from "../layout/AdminRefreshButton";
import { DemoStat } from "../demo/DemoStat";
import classes from "../demo/DemoStat.module.css";

export default function DemoPanel() {
  const { user } = useAuth();
  const { data: usage, isLoading, isFetching, refetch } = useGetDemoUsageQuery();
  const [setLimit, { isLoading: saving }] = useSetDemoLimitMutation();
  const [draftLimit, setDraftLimit] = useState<number | string>(3);

  useEffect(() => {
    if (usage?.limit) setDraftLimit(usage.limit);
  }, [usage?.limit]);

  const dirty = usage ? Number(draftLimit) !== usage.limit : false;

  const save = async () => {
    trace(user?.id, "set_demo_limit", "demo_usage", "demo_usage");
    try {
      const r = await setLimit(Number(draftLimit)).unwrap();
      notify.success(`One visitor may now start ${r.limit} demo${r.limit === 1 ? "" : "s"} a day.`, "Limit updated");
    } catch (e) {
      notify.error(errMessage(e, "Could not update the limit."));
    }
  };

  return (
    <AdminSection id="demo" actions={<AdminRefreshButton onClick={refetch} loading={isFetching} />}>
      {isLoading ? (
        <Center py={64}><Loader size="sm" /></Center>
      ) : (
        <Stack gap="lg">
          <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md">
            <DemoStat icon={PlayCircle} label="Demos started, last 24 hours" value={num(usage?.today ?? 0)} />
            <DemoStat icon={Globe2} label="Different visitors" value={num(usage?.activeIps ?? 0)} />
            <DemoStat
              icon={ShieldAlert}
              label="Turned away by the limit"
              value={num(usage?.blocked ?? 0)}
              tone={(usage?.blocked ?? 0) > 0 ? "warn" : undefined}
            />
          </SimpleGrid>

          <Card withBorder radius="lg" padding="lg">
            <div className={classes.limitRow}>
              <div className={classes.limitText}>
                <Text fw={650} size="sm">Daily limit per visitor</Text>
                <Text size="xs" c="dimmed" mt={2}>
                  How many demos one visitor may start in a rolling 24 hours. Further attempts are refused with a
                  time to try again.
                </Text>
              </div>
              <Group gap="sm" wrap="nowrap">
                <NumberInput
                  value={draftLimit}
                  onChange={setDraftLimit}
                  min={1}
                  max={1000}
                  w={110}
                  size="sm"
                  radius="md"
                  aria-label="Daily demo limit per visitor"
                />
                <Button size="sm" radius="md" color="emerald" leftSection={<Check size={15} />} disabled={!dirty} loading={saving} onClick={save}>
                  Save
                </Button>
              </Group>
            </div>
          </Card>

          <Alert variant="light" color="gray" icon={<Info size={16} />} radius="lg">
            <Text size="sm">
              Demo visitors are never recorded. Each start is kept for 24 hours as a one-way hash of the visitor's
              address and nothing else: enough to count repeat visits, not enough to identify anyone. These figures
              only ever cover the last 24 hours{usage?.since ? ` (since ${timeAgo(usage.since)})` : ""}.
            </Text>
          </Alert>
        </Stack>
      )}
    </AdminSection>
  );
}
