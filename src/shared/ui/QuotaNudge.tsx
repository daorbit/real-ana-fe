import { useState } from "react";
import { Alert, Button, Group, Text } from "@mantine/core";
import { AlertTriangle, ArrowUpCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { useGetWorkspaceUsageQuery } from "@/app/store";

 
type Meter = { key: string; label: string; used: number; total: number };

const WARN_AT = 0.8;

export function QuotaNudge() {
  const nav = useNavigate();
  const { active } = useWorkspace();
  const { user } = useAuth();
  const { data } = useGetWorkspaceUsageQuery(active?._id ?? "", { skip: !active?._id });
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Demo sessions have no real plan to upgrade, and an impersonated session
  // must not nag about someone else's usage.
  if (!data || user?.demo || user?.impersonating) return null;

  const meters: Meter[] = [
    {
      key: "audits",
      label: "SEO audits",
      used: data.audits.used,
      total: data.audits.planQuota + data.audits.addonCredits,
    },
    {
      key: "crawls",
      label: "site crawls",
      used: data.crawls.used,
      total: data.crawls.planQuota + data.crawls.addonCredits,
    },
    {
      key: "events",
      label: "analytics events",
      used: data.events.used,
      total: data.events.planQuota,
    },
    ...(data.orbit
      ? [
          {
            key: "orbit",
            label: "Orbit questions",
            used: data.orbit.used,
            total: data.orbit.planQuota + data.orbit.addonCredits,
          },
        ]
      : []),
  ];

  const hot = meters
    .filter((m) => m.total > 0 && m.used / m.total >= WARN_AT && !dismissed.has(m.key))
    .sort((a, b) => b.used / b.total - a.used / a.total)[0];

  if (!hot) return null;

  const pct = Math.min(100, Math.round((hot.used / hot.total) * 100));
  const spent = hot.used >= hot.total;

  return (
    <Alert
      color={spent ? "red" : "yellow"}
      variant="light"
      radius="md"
      icon={<AlertTriangle size={16} />}
      mb="md"
      withCloseButton={false}
    >
      <Group justify="space-between" wrap="nowrap" gap="md">
        <Text size="sm">
          {spent ? (
            <>
              This workspace has used all its {hot.label} for the cycle. Buy an
              add-on pack or move up a plan to keep going.
            </>
          ) : (
            <>
              {pct}% of this workspace's {hot.label} used this cycle. Top up
              before it runs out.
            </>
          )}
        </Text>
        <Group gap="xs" wrap="nowrap">
          <Button
            size="xs"
            variant={spent ? "filled" : "light"}
            color={spent ? "red" : "yellow"}
            leftSection={<ArrowUpCircle size={14} />}
            onClick={() => nav("/app/billing")}
          >
            View plans
          </Button>
          <Button
            size="xs"
            variant="subtle"
            color="gray"
            px={6}
            onClick={() => setDismissed((s) => new Set(s).add(hot.key))}
            aria-label="Dismiss"
          >
            <X size={14} />
          </Button>
        </Group>
      </Group>
    </Alert>
  );
}
