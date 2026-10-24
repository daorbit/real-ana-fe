import { Button } from "@mantine/core";
import { Filter, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { stepCountLabel } from "../lib/funnelFormat";
import type { FunnelPreset } from "../lib/funnelPresets";
import classes from "./Funnels.module.css";

export function FunnelsEmpty({ presets, canEdit }: { presets: FunnelPreset[]; canEdit: boolean }) {
  return (
    <section className={classes.empty}>
      <div className={classes.emptyIntro}>
        <span className={classes.emptyArt} aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <h2 className={classes.emptyTitle}>Track your first funnel</h2>
        <p className={classes.emptyText}>
          A funnel is the path to a signup or a sale, such as home page, then pricing, then sign up. Quantalog counts how
          many visitors make it through each step and shows where the rest leave.
        </p>
        {canEdit ? (
          <Button component={Link} to="/app/funnels/new" leftSection={<Plus size={15} />}>
            Create a funnel
          </Button>
        ) : (
          <p className={classes.emptyText}>Ask an editor in this workspace to create one.</p>
        )}
      </div>

      {canEdit && presets.length > 0 && (
        <div className={classes.presetBlock}>
          <span className={classes.presetTitle}>Or start from your traffic</span>
          <ul className={classes.presetList}>
            {presets.map((preset) => (
              <li key={preset.key} className={classes.presetRow}>
                <span className={classes.presetIcon} aria-hidden>
                  <Filter size={16} />
                </span>
                <span className={classes.presetText}>
                  <span className={classes.presetPath} title={preset.label}>
                    {preset.label}
                  </span>
                  <span className={classes.presetHint}>{preset.hint}</span>
                </span>
                <span className={classes.presetCount}>{stepCountLabel(preset.steps.length)}</span>
                <Button component={Link} to={`/app/funnels/new?preset=${preset.key}`} variant="default" size="xs">
                  Use
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
