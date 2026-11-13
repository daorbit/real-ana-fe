import { Slider, Switch } from "@mantine/core";
import { TipText } from "@/shared/ui/InfoTip";
import { DETECTOR_META, SOURCE_LABEL } from "../lib/labels";
import { THRESHOLD_HELP } from "../lib/help";
import type { DetectorInfo, DetectorSetting } from "../types";
import rows from "./Rows.module.css";

export function CheckSettingRow({
  info,
  setting,
  canEdit,
  onChange,
}: {
  info: DetectorInfo;
  setting: DetectorSetting;
  canEdit: boolean;
  onChange: (patch: Partial<DetectorSetting>) => void;
}) {
  const meta = DETECTOR_META[info.id];
  const { min, max, step, default: fallback } = info.threshold;

  return (
    <div className={rows.settingRow} data-off={!setting.enabled || undefined}>
      <div className={rows.settingHead}>
        <span className={rows.settingText}>
          <span className={rows.settingTitle}>{meta.title}</span>
          <span className={rows.settingHint}>{meta.summary}</span>
        </span>
        <Switch
          checked={setting.enabled}
          disabled={!canEdit}
          aria-label={`${meta.title} check`}
          onChange={(e) => onChange({ enabled: e.currentTarget.checked })}
        />
      </div>
      <div className={rows.settingBody}>
        <div className={rows.thresholdHead}>
          <TipText label={THRESHOLD_HELP}>{meta.thresholdLabel}</TipText>
          <span className={rows.thresholdValue}>{setting.threshold}%</span>
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          label={null}
          value={setting.threshold}
          disabled={!canEdit || !setting.enabled}
          onChange={(threshold) => onChange({ threshold })}
          aria-label={meta.thresholdLabel}
        />
        <span className={rows.settingMeta}>
          {meta.describe(setting.threshold)} Uses {info.requires.map((s) => SOURCE_LABEL[s]).join(" and ")}. Default {fallback}%.
        </span>
      </div>
    </div>
  );
}
