import { NumberInput, Switch } from "@mantine/core";
import { RULE_META } from "@/features/alerts/lib/alertMeta";
import type { AlertRule, RuleConfig } from "@/features/alerts/types";
import classes from "@/features/alerts/components/Alerts.module.css";

export function RuleRow({
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

  return (
    <div className={classes.row} data-off={!config.enabled || blocked || undefined}>
      <span className={classes.icon} data-tone={meta.tone}>
        <Icon size={17} />
      </span>
      <div className={classes.text}>
        <div className={classes.title}>{meta.title}</div>
        <div className={classes.description}>{meta.describe(config.value)}</div>
        {blocked && <div className={classes.hint}>Turn on Quantalog Goals in Apps to use this alert.</div>}
      </div>
      <div className={classes.controls}>
        <NumberInput
          className={classes.threshold}
          size="xs"
          value={config.value}
          min={meta.min}
          max={meta.max}
          step={meta.step}
          clampBehavior="strict"
          allowDecimal={false}
          rightSection={<span>{meta.unit === "%" ? "%" : meta.unit === "hours" ? "h" : "d"}</span>}
          disabled={!canEdit || !config.enabled}
          aria-label={`${meta.title} threshold`}
          onChange={(v) => {
            const n = Number(v);
            if (Number.isFinite(n) && n >= meta.min) onChange({ value: n });
          }}
        />
        <Switch
          checked={config.enabled}
          disabled={!canEdit}
          aria-label={`${meta.title} alert`}
          onChange={(e) => onChange({ enabled: e.currentTarget.checked })}
        />
      </div>
    </div>
  );
}
