import { Button, Text } from "@mantine/core";
import { Link2, Share2 } from "lucide-react";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";

export function ShareStartPanel({
  workspace,
  busy,
  onEnable,
}: {
  workspace: string;
  busy: boolean;
  onEnable: () => void;
}) {
  return (
    <StartScreen>
      <StartHero
        id="share-start-title"
        icon={<Share2 size={28} />}
        title="Share a live dashboard with anyone"
        text={`Give clients or your team a read-only view of ${workspace || "this workspace"}'s traffic at a private link. No account needed, and the numbers stay live.`}
      >
        <Button
          size="md"
          color="emerald"
          leftSection={<Link2 size={16} />}
          loading={busy}
          onClick={onEnable}
        >
          Turn on public link
        </Button>
        <Text size="xs" c="dimmed" ta="center">
          You choose what's visible before you send it to anyone.
        </Text>
      </StartHero>
    </StartScreen>
  );
}
