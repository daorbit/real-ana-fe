import { Tooltip } from "@mantine/core";
import { Pill } from "@/features/seo/components/shared/Pill";
import { SplitBar } from "@/features/seo/components/shared/Bars";
import type { Tone } from "@/features/seo/components/shared/tone";
import classes from "./performance.module.css";

export type VitalSplit = { good: number; mid: number; poor: number };

export function VitalCard({
  label,
  name,
  hint,
  value,
  status,
  tone,
  split,
  foot,
}: {
  label: string;
  name: string;
  hint: string;
  value: string;
  status: string;
  tone: Tone;
  split?: VitalSplit;
  foot?: string;
}) {
  return (
    <div className={classes.vital}>
      <div className={classes.vitalTop}>
        <Tooltip label={hint} withArrow multiline w={260}>
          <span className={classes.vitalKey}>{label}</span>
        </Tooltip>
        <Pill tone={tone}>{status}</Pill>
      </div>
      <span className={classes.vitalValue}>{value}</span>
      <span className={classes.vitalName}>{name}</span>
      {split && (
        <>
          <SplitBar
            good={split.good}
            mid={split.mid}
            poor={split.poor}
            label={`${split.good}% good, ${split.mid}% needs work, ${split.poor}% poor`}
          />
          <span className={classes.vitalFoot}>
            {foot ?? `${split.good}% good · ${split.mid}% needs work · ${split.poor}% poor`}
          </span>
        </>
      )}
      {!split && foot && <span className={classes.vitalFoot}>{foot}</span>}
    </div>
  );
}
