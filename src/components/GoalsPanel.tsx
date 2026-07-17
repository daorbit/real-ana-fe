import { useState } from "react";
import {
  Card, Group, Text, Stack, Button, TextInput, SegmentedControl, ActionIcon,
  Center, ThemeIcon, Progress, Badge, Tooltip,
} from "@mantine/core";
import { Target, Plus, Trash2, Inbox } from "lucide-react";
import { useCreateGoalMutation, useDeleteGoalMutation } from "../store";
import { notify, errMessage, confirmDelete } from "../notify";
import type { GoalResult } from "../types";

 
export function GoalsPanel({
  workspaceId,
  goals,
}: {
  workspaceId: string;
  goals: GoalResult[];
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"page" | "event">("page");
  const [match, setMatch] = useState("");

  const [create, { isLoading: creating }] = useCreateGoalMutation();
  const [remove] = useDeleteGoalMutation();

  const add = async () => {
    const n = name.trim();
    const m = match.trim();
    if (!n || !m) return;
    try {
      await create({ workspaceId, name: n, kind, match: m }).unwrap();
      setName("");
      setMatch("");
      notify.success("Goal added.", "Goals");
    } catch (e) {
      notify.error(errMessage(e, "Could not add the goal."));
    }
  };

  const del = (g: GoalResult) =>
    confirmDelete({
      title: "Delete goal?",
      body: <><b>{g.name}</b> will stop being tracked. Past traffic is not affected.</>,
      onConfirm: async () => {
        try {
          await remove({ workspaceId, goalId: g.id }).unwrap();
        } catch (e) {
          notify.error(errMessage(e, "Could not delete the goal."));
        }
      },
    });

  const maxRate = Math.max(1, ...goals.map((g) => g.conversionRate));

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md">
        <Target size={15} className="sect-ic" />
        <Text fw={600} c="dimmed" size="sm">Conversion goals</Text>
      </Group>

      {/* Add a goal */}
      <Stack gap="sm" mb="lg">
        <Group gap="sm" align="flex-end" wrap="wrap">
          <TextInput
            label="Name"
            placeholder="Signup"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 140 }}
          />
          <SegmentedControl
            size="sm"
            color="emerald"
            value={kind}
            onChange={(v) => setKind(v as "page" | "event")}
            data={[
              { label: "Page", value: "page" },
              { label: "Event", value: "event" },
            ]}
          />
        </Group>
        <Group gap="sm" align="flex-end" wrap="nowrap">
          <TextInput
            label={kind === "page" ? "Path" : "Event name"}
            placeholder={kind === "page" ? "/thank-you" : "purchase"}
            value={match}
            onChange={(e) => setMatch(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            style={{ flex: 1 }}
          />
          <Button
            leftSection={<Plus size={15} />}
            onClick={add}
            loading={creating}
            disabled={!name.trim() || !match.trim()}
          >
            Add
          </Button>
        </Group>
      </Stack>

      {/* Results */}
      {goals.length === 0 ? (
        <Center py="xl" mih={120}>
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
            <Text c="dimmed" size="xs">No goals yet — add one above.</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="md">
          {goals.map((g) => (
            <div key={g.id}>
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>{g.name}</Text>
                  <Badge size="xs" variant="light" color={g.kind === "event" ? "grape" : "cyan"}>
                    {g.match}
                  </Badge>
                </Group>
                <Group gap="sm" wrap="nowrap">
                  <Text size="sm" fw={700}>{g.conversionRate}%</Text>
                  <Text size="xs" c="dimmed">{g.conversions} conv.</Text>
                  <Tooltip label="Delete goal" withArrow>
                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => del(g)}>
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
              <Progress value={(g.conversionRate / maxRate) * 100} size="xs" radius="xl" color="emerald" />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
