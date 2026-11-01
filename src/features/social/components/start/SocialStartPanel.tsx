import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import { Link2, Plus, Send } from "lucide-react";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import { APPS_PATH } from "@/features/integrations/lib/appsPath";
import { WeekStrip } from "./WeekStrip";

const NETWORKS = "LinkedIn or Instagram";

export function SocialStartPanel({
  connected,
  disabled,
  onCreate,
}: {
  connected: boolean;
  disabled: boolean;
  onCreate: (date?: string) => void;
}) {
  return (
    <StartScreen>
      <StartHero
        id="social-start-title"
        icon={<Send size={26} />}
        title={connected ? "Nothing scheduled yet" : "Post on schedule, without the reminders"}
        text={
          connected
            ? "Write a post, pick a time and Quantalog publishes it for you — once, or on a repeating schedule."
            : `Connect ${NETWORKS} and Quantalog publishes your posts at the time you choose — once, or every week on repeat.`
        }
      >
        {connected ? (
          <Button size="md" color="emerald" leftSection={<Plus size={16} />} disabled={disabled} onClick={() => onCreate()}>
            Schedule your first post
          </Button>
        ) : (
          <>
            <Button
              component={Link}
              to={APPS_PATH}
              size="md"
              color="emerald"
              leftSection={<Link2 size={16} />}
            >
              Connect {NETWORKS}
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              Takes a few seconds. You can disconnect it any time from Apps.
            </Text>
          </>
        )}
      </StartHero>

      <WeekStrip interactive={connected && !disabled} onPickDay={(date) => onCreate(date)} />
    </StartScreen>
  );
}
