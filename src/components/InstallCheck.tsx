import { Card, Group, Text, Button, ThemeIcon, List, Collapse } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, CheckCircle2, AlertTriangle, RotateCw } from "lucide-react";
import { useInstallCheck } from "../hooks";

export function InstallCheck({
  workspaceId,
  siteId,
  domain,
  autoStart = false,
}: {
  workspaceId: string;
  siteId: string;
  domain?: string;
  autoStart?: boolean;
}) {
  const { phase, start, secondsLeft, progress } = useInstallCheck(workspaceId, siteId, autoStart);
  const site = domain ? <b>{domain}</b> : "your site";

  return (
    <Card withBorder radius="md" padding="md" className="install-check">
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="gray" radius="md" size="lg"><Radar size={17} /></ThemeIcon>
                <div>
                  <Text fw={600} size="sm">Verify installation</Text>
                  <Text size="xs" c="dimmed">Paste the snippet, open {site}, then check.</Text>
                </div>
              </Group>
              <Button size="xs" onClick={start}>Check now</Button>
            </Group>
          </motion.div>
        )}

        {phase === "listening" && (
          <motion.div key="listening" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Group gap="sm" wrap="nowrap" mb="sm">
              <div className="radar-wrap">
                <span className="radar-ring" />
                <span className="radar-ring d2" />
                <ThemeIcon variant="light" color="emerald" radius="xl" size="lg"><Radar size={17} /></ThemeIcon>
              </div>
              <div style={{ flex: 1 }}>
                <Text fw={600} size="sm">Listening for traffic…</Text>
                <Text size="xs" c="dimmed">
                  Open {site} in a new tab. We'll detect the first pageview automatically.
                </Text>
              </div>
              <Text size="xs" c="dimmed" fw={600}>{secondsLeft}s</Text>
            </Group>
            <div className="scan-track">
              <motion.div className="scan-bar" animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
            </div>
          </motion.div>
        )}

        {phase === "installed" && (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Group gap="sm" wrap="nowrap">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16 }}
              >
                <ThemeIcon variant="light" color="teal" radius="xl" size="lg"><CheckCircle2 size={18} /></ThemeIcon>
              </motion.div>
              <div>
                <Text fw={650} size="sm" c="teal">Script detected — you're live</Text>
                <Text size="xs" c="dimmed">
                  We received a pageview from {site}. Data is now flowing into Analytics.
                </Text>
              </div>
            </Group>
          </motion.div>
        )}

        {phase === "not-found" && (
          <motion.div key="nope" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Group justify="space-between" wrap="nowrap" mb="sm">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon variant="light" color="yellow" radius="xl" size="lg"><AlertTriangle size={17} /></ThemeIcon>
                <div>
                  <Text fw={650} size="sm">No traffic detected yet</Text>
                  <Text size="xs" c="dimmed">The snippet hasn't reported a pageview. Check the points below.</Text>
                </div>
              </Group>
              <Button size="xs" variant="light" leftSection={<RotateCw size={13} />} onClick={start}>Retry</Button>
            </Group>
            <Collapse expanded>
              <List size="xs" spacing={4} c="dimmed" pl="xs">
                <List.Item>The snippet is inside <b>&lt;head&gt;</b> and the site was <b>redeployed</b>.</List.Item>
                <List.Item>You actually opened the page in a browser after adding it.</List.Item>
                <List.Item>An ad blocker isn't blocking the request — try an incognito window.</List.Item>
                <List.Item>The <b>data-site</b> value matches this site's ID exactly.</List.Item>
              </List>
            </Collapse>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
