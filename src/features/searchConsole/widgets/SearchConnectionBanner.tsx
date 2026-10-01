import { Alert, Button, Group, Text } from "@mantine/core";
import { PlugZap, Unplug } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { usePermissions } from "@/features/workspace/context";
import { useSearchWidgetsConnect } from "@/features/searchConsole/widgets/searchWidgetsContext";
import { useSearchWidgetSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";
import type { SearchSourceInput } from "@/features/searchConsole/widgets/useSearchWidgetSource";

export function SearchConnectionBanner(input: SearchSourceInput) {
  const source = useSearchWidgetSource(input);
  const { canAdmin } = usePermissions();
  const ctx = useSearchWidgetsConnect();

  if (source.kind !== "reconnect" && source.kind !== "connect") return null;

  const lost = source.kind === "reconnect";
  const title = lost ? "Google Search is disconnected" : "Google Search isn't connected yet";
  const body = lost
    ? "The Search widgets on this dashboard have stopped updating. Reconnect Google to bring them back."
    : "This dashboard includes Search widgets. Connect Google to fill them with clicks, rankings and queries.";

  return (
    <Alert
      color={lost ? "orange" : "blue"}
      variant="light"
      radius="lg"
      mb="lg"
      icon={lost ? <Unplug size={17} /> : <PlugZap size={17} />}
      title={title}
    >
      <Group justify="space-between" gap="sm" wrap="wrap">
        <Text size="sm">{canAdmin ? body : `${body} Ask a workspace admin to do it.`}</Text>
        {canAdmin && ctx && (
          <Button
            size="xs"
            variant="default"
            leftSection={<GoogleMark size={13} />}
            loading={ctx.connecting}
            onClick={ctx.connect}
          >
            {lost ? "Reconnect Google" : "Connect Google"}
          </Button>
        )}
      </Group>
    </Alert>
  );
}
