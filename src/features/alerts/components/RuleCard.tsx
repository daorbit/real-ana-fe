import { Anchor, Slider, Switch } from "@mantine/core";
import { Link } from "react-router-dom";
import { RULE_META } from "@/features/alerts/lib/alertMeta";
import { appsPath } from "@/features/integrations/lib/appsPath";
import type { AlertRule, RuleConfig } from "@/features/alerts/types";
import classes from "@/features/alerts/components/Alerts.module.css";

function unitLabel(unit: string, value: number): string {
  if (unit === "%") return `${value}%`;
  if (unit === "hours") return `${value} ${value === 1 ? "hour" : "hours"}`;
  return `${value} ${value === 1 ? "day" : "days"}`;
}

export function RuleCard({
  rule,
  config,
  canEdit,
  goalsOn,
  onChange,
}: {
  rule: AlertRule;
  config: RuleConfig;
  canEdit: boolean;
  goalsOn: boolean;
  onChange: (patch: Partial<RuleConfig>) => void;
}) {
  const meta = RULE_META[rule];
  const Icon = meta.icon;
  const blocked = Boolean(meta.needsGoals && !goalsOn);
  const on = config.enabled && !blocked;

  return (
    <div className={classes.rule} data-on={on || undefined} data-off={!on || undefined}>
      <div className={classes.ruleHead}>
        <span className={classes.icon} data-tone={meta.tone}>
          <Icon size={17} />
        </span>
        <div className={classes.text}>
          <div className={classes.title}>{meta.title}</div>
        </div>
        <Switch
          checked={config.enabled}
          disabled={!canEdit}
          aria-label={`${meta.title} alert`}
          onChange={(e) => onChange({ enabled: e.currentTarget.checked })}
        />
      </div>
      <div className={classes.ruleBody}>
        <div className={classes.description}>{meta.describe(config.value)}</div>
        <div>
          <div className={classes.thresholdHead}>
            <span>Threshold</span>
            <span className={classes.thresholdValue}>{unitLabel(meta.unit, config.value)}</span>
          </div>
          <Slider
            min={meta.min}
            max={meta.max}
            step={meta.step}
            label={null}
            value={config.value}
            disabled={!canEdit || !config.enabled}
            onChange={(value) => onChange({ value })}
          />
          <div className={classes.thresholdRange}>
            <span>{unitLabel(meta.unit, meta.min)}</span>
            <span>{unitLabel(meta.unit, meta.max)}</span>
          </div>
        </div>
      </div>
      {blocked && (
        <div className={classes.hint}>
          Needs Quantalog Goals.{" "}
          <Anchor component={Link} to={appsPath("quantalog-goals")} size="xs">
            Turn it on
          </Anchor>
        </div>
      )}
    </div>
  );
}
