import { Button, Group, Text } from "@mantine/core";
import { CalendarClock, Plus } from "lucide-react";
import { StartHero, StartScreen } from "@/shared/ui/start/StartScreen";
import type { Draft } from "@/features/reports/pages/types";
import { ReportTemplatePicker } from "./ReportTemplatePicker";

export function ReportsStartPanel({
  canEdit,
  disabled,
  workspace,
  onCreate,
}: {
  canEdit: boolean;
  disabled: boolean;
  workspace: string;
  onCreate: (preset?: Partial<Draft>) => void;
}) {
  return (
    <StartScreen>
      <StartHero
        id="reports-start-title"
        icon={<CalendarClock size={28} />}
        title={canEdit ? "Your numbers, in your inbox" : "No reports scheduled yet"}
        text={
          canEdit
            ? "Schedule a report and Quantalog emails a clean summary of traffic and SEO — daily, weekly or monthly — to you, your team or your clients."
            : "Nobody has scheduled a report in this workspace yet. An editor can set one up and add you as a recipient."
        }
      >
        {canEdit && (
          <>
            <Group gap="sm" justify="center">
              <Button size="md" color="emerald" leftSection={<Plus size={16} />} disabled={disabled} onClick={() => onCreate()}>
                Create a report
              </Button>
            </Group>
            <Text size="xs" c="dimmed" ta="center">
              Preview the exact email before anything is sent. Pause or delete it any time.
            </Text>
          </>
        )}
      </StartHero>

      <ReportTemplatePicker canEdit={canEdit} disabled={disabled} workspace={workspace} onCreate={onCreate} />
    </StartScreen>
  );
}
