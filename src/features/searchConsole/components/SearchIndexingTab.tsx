import { Alert, Badge, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { AlertTriangle, CheckCircle2, CircleSlash, SearchX } from "lucide-react";
import type { SearchPerformance } from "@/shared/types";
import classes from "./searchConsole.module.css";

export function SearchIndexingTab({ data }: { data: SearchPerformance }) {
  const summary = data.indexingSummary;

  if (!summary) {
    return (
      <Alert color="yellow" variant="light" icon={<AlertTriangle size={16} />}>
        Google indexing data is not available for this property yet.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <div className={classes.card}>
          <Text size="xs" c="dimmed">Indexed</Text>
          <Group gap="xs" mt={6}>
            <CheckCircle2 size={16} color="var(--mantine-color-teal-6)" />
            <Text fw={700} size="lg">{summary.indexed}</Text>
          </Group>
        </div>
        <div className={classes.card}>
          <Text size="xs" c="dimmed">Not indexed</Text>
          <Group gap="xs" mt={6}>
            <SearchX size={16} color="var(--mantine-color-red-6)" />
            <Text fw={700} size="lg">{summary.notIndexed}</Text>
          </Group>
        </div>
        <div className={classes.card}>
          <Text size="xs" c="dimmed">Blocked</Text>
          <Group gap="xs" mt={6}>
            <CircleSlash size={16} color="var(--mantine-color-yellow-7)" />
            <Text fw={700} size="lg">{summary.blocked}</Text>
          </Group>
        </div>
        <div className={classes.card}>
          <Text size="xs" c="dimmed">Pages checked</Text>
          <Group gap="xs" mt={6}>
            <Badge color="blue" variant="light">{summary.totalPages}</Badge>
          </Group>
        </div>
      </SimpleGrid>

      <div className={classes.card}>
        <Text fw={650} size="sm" mb="xs">Indexed page status</Text>
        <Stack gap={8}>
          {summary.pages.length === 0 ? (
            <Text size="sm" c="dimmed">No page inspection data is available yet.</Text>
          ) : (
            summary.pages.slice(0, 10).map((page) => (
              <div key={page.url} style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <Text size="sm" style={{ overflowWrap: "anywhere" }}>{page.url}</Text>
                <Badge
                  color={page.indexStatus.includes("Indexed") ? "teal" : page.indexStatus.includes("Not indexed") ? "red" : "gray"}
                  variant="light"
                >
                  {page.indexStatus}
                </Badge>
              </div>
            ))
          )}
        </Stack>
      </div>
    </Stack>
  );
}
