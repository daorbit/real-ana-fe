import { useEffect, useState } from "react";
import { Button, Group, Modal, Select, Stack, Switch, Text } from "@mantine/core";
import type { Experiment, ExperimentResults } from "@/features/experiments/types";

interface Props {
  opened: boolean;
  experiment: Experiment;
  results: ExperimentResults;
  busy: boolean;
  onClose: () => void;
  onEnd: (winner: string, keepWinner: boolean) => void;
}

const NO_WINNER = "none";

export function EndTestModal({ opened, experiment, results, busy, onClose, onEnd }: Props) {
  const [winner, setWinner] = useState<string>(NO_WINNER);
  const [keep, setKeep] = useState(true);
  const canKeep = experiment.type !== "code" && winner !== NO_WINNER && winner !== experiment.variants[0]?.key;

  useEffect(() => {
    if (opened) setWinner(results.winner ?? results.leader ?? NO_WINNER);
  }, [opened, results.leader, results.winner]);

  const options = [
    { value: NO_WINNER, label: "No winner" },
    ...experiment.variants.map((v) => ({ value: v.key, label: v.name })),
  ];

  return (
    <Modal opened={opened} onClose={onClose} title="End this test" centered>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Visitors stop being split and results stop counting. An ended test cannot be restarted.
        </Text>
        <Select label="Winner" data={options} value={winner} allowDeselect={false} onChange={(value) => value && setWinner(value)} />
        {canKeep && (
          <Switch
            label="Show the winner to every visitor"
            description="Keeps applying the winning variant until you change your site."
            checked={keep}
            onChange={(e) => setKeep(e.currentTarget.checked)}
          />
        )}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} onClick={() => onEnd(winner === NO_WINNER ? "" : winner, canKeep && keep)}>
            End test
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
