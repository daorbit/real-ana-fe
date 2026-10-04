import { Link } from "react-router-dom";
import { Button, Text } from "@mantine/core";
import { Link2, Plus, Send } from "lucide-react";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import { settingsPath } from "@/features/auth/components/settings/settingsSections";
import { WeekStrip } from "./WeekStrip";

export function SocialStartPanel({
  connected,
  instagramAvailable,
  disabled,
  onCreate,
  onConnect,
}: {
  connected: boolean;
  instagramAvailable: boolean;
  disabled: boolean;
  onCreate: (date?: string) => void;
  onConnect: () => void;
}) {
  const networks = instagramAvailable ? "LinkedIn or Instagram" : "LinkedIn";

  return (
    <StartScreen>
      <StartHero
        id="social-start-title"
        icon={<Send size={26} />}
        title={connected ? "Nothing scheduled yet" : "Post on schedule, without the reminders"}
        text={
          connected
            ? "Write a post, pick a time and Quantalog publishes it for you — once, or on a repeating schedule."
            : `Connect ${networks} and Quantalog publishes your posts at the time you choose — once, or every week on repeat.`
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
              to={settingsPath("connections")}
              size="md"
              color="emerald"
              leftSection={<Link2 size={16} />}
              onClick={onConnect}
            >
              Connect {networks}
            </Button>
            <Text size="xs" c="dimmed" ta="center">
              Takes a few seconds. You can disconnect it any time from Settings.
            </Text>
          </>
        )}
      </StartHero>

      <WeekStrip interactive={connected && !disabled} onPickDay={(date) => onCreate(date)} />
    </StartScreen>
  );
}
