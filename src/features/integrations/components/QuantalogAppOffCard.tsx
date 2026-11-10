import { Link } from "react-router-dom";
import { Button, Card, Center, Stack, Text } from "@mantine/core";
import { Power } from "lucide-react";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";
import type { WorkspaceAppId } from "@/shared/types";

export function QuantalogAppOffCard({ app, to }: { app: WorkspaceAppId; to: string }) {
  const info = WORKSPACE_APP_INFO[app];
  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Center h="100%" py="md">
        <Stack align="center" gap={10}>
          <BrandMark id={info.tileId} size={44} />
          <Text fw={600} size="sm">
            {info.name}
          </Text>
          <Text size="xs" c="dimmed" ta="center" maw={260}>
            {info.tagline}
          </Text>
          <Button component={Link} to={to} size="xs" variant="light" leftSection={<Power size={13} />}>
            Turn on {info.navLabel}
          </Button>
        </Stack>
      </Center>
    </Card>
  );
}
