import { Link } from "react-router-dom";
import { Button, Card, Center, Stack, Text } from "@mantine/core";
import { Power } from "lucide-react";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";

const INFO = WORKSPACE_APP_INFO.goals;

export function GoalsAppOffCard() {
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Center h="100%" py="md">
        <Stack align="center" gap={10}>
          <BrandMark id={INFO.tileId} size={44} />
          <Text fw={600} size="sm">
            {INFO.name}
          </Text>
          <Text size="xs" c="dimmed" ta="center" maw={260}>
            {INFO.tagline}
          </Text>
          <Button component={Link} to="/app/goals" size="xs" variant="light" radius="xl" leftSection={<Power size={13} />}>
            Turn on Goals
          </Button>
        </Stack>
      </Center>
    </Card>
  );
}
