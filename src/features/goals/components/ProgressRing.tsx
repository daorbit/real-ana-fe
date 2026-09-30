import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { Tone } from "@/features/goals/tones";
import classes from "@/features/goals/components/Goals.module.css";

export type RingSpec = { value: number; tone: Tone };

const EASE = [0.22, 1, 0.36, 1] as const;

export function Rings({
  rings,
  size,
  stroke,
  gap = 3,
  delay = 0,
  children,
}: {
  rings: RingSpec[];
  size: number;
  stroke: number;
  gap?: number;
  delay?: number;
  children?: ReactNode;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = size / 2;

  return (
    <div className={classes.ring}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          {rings.map((ring, i) => (
            <linearGradient key={i} id={`${uid}-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={ring.tone[0]} />
              <stop offset="100%" stopColor={ring.tone[1]} />
            </linearGradient>
          ))}
        </defs>
        {rings.map((ring, i) => {
          const r = c - stroke / 2 - i * (stroke + gap);
          if (r <= stroke / 2) return null;
          return (
            <g key={i}>
              <circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke} stroke={ring.tone[1]} className={classes.ringTrack} />
              <motion.circle
                cx={c}
                cy={c}
                r={r}
                fill="none"
                stroke={`url(#${uid}-${i})`}
                strokeWidth={stroke}
                strokeLinecap="round"
                transform={`rotate(-90 ${c} ${c})`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: Math.max(0.002, Math.min(ring.value, 1)) }}
                transition={{ duration: 1.2, delay: delay + i * 0.12, ease: EASE }}
              />
            </g>
          );
        })}
      </svg>
      {children && <div className={classes.ringCenter}>{children}</div>}
    </div>
  );
}

export function ProgressRing({
  value,
  tone,
  size = 104,
  stroke = 11,
  delay,
  children,
}: {
  value: number;
  tone: Tone;
  size?: number;
  stroke?: number;
  delay?: number;
  children?: ReactNode;
}) {
  return (
    <Rings rings={[{ value, tone }]} size={size} stroke={stroke} delay={delay}>
      {children}
    </Rings>
  );
}
