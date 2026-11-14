import { Box } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useRadarSettings } from "../hooks/useRadarData";
import { useRadarSettingsDraft } from "../hooks/useRadarSettingsDraft";
import { CheckSettingRow } from "./CheckSettingRow";
import { SwitchRow } from "./SwitchRow";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";
import rows from "./Rows.module.css";

export function SettingsTab({ workspaceId, canEdit }: { workspaceId: string; canEdit: boolean }) {
  const { settings, loading, failed } = useRadarSettings(workspaceId, true);
  const { draft, setDetector, setFlag } = useRadarSettingsDraft(workspaceId, settings?.config ?? null);

  if (failed) return <ErrorState />;
  if (loading || !settings || !draft) return (
      <Box mt="xl">
        <PanelSkeleton height={420} />
      </Box>
    );

  return (
    <div className={classes.page}>
      <section className={classes.section}>
        <SectionHeader
          title="Checks"
          help="Each check is a fixed rule. The threshold sets how big a change must be before it is reported."
          aside={<span className={classes.sectionNote}>Lower thresholds find more, with more false alarms</span>}
        />
        <div className={rows.group}>
          {settings.detectors.map((info) => (
            <CheckSettingRow
              key={info.id}
              info={info}
              setting={draft.detectors[info.id]}
              canEdit={canEdit}
              onChange={(patch) => setDetector(info.id, patch)}
            />
          ))}
        </div>
      </section>

      <section className={classes.section}>
        <SectionHeader title="Notifications" />
        <div className={rows.group}>
          <SwitchRow
            title="High-priority findings"
            hint="A bell notification when a new high-priority finding appears, or one comes back after you resolved it. Never twice for the same unchanged finding."
            checked={draft.notifyHighPriority}
            disabled={!canEdit}
            onChange={(on) => setFlag("notifyHighPriority", on)}
          />
        </div>
      </section>

      <section className={classes.section}>
        <SectionHeader title="Wording" />
        <div className={rows.group}>
          <SwitchRow
            title="Plain-language summaries from Orbit"
            hint="Orbit rewrites each finding in two sentences using only its numbers. A summary that adds a number or a cause is thrown away. Turn off to keep the rule-based wording."
            checked={draft.aiExplanations}
            disabled={!canEdit}
            onChange={(on) => setFlag("aiExplanations", on)}
          />
        </div>
      </section>
    </div>
  );
}
