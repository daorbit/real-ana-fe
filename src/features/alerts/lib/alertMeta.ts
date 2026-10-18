import { Flag, Inbox, Mail, MessageCircle, SatelliteDish, Send, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { AlertChannel, AlertRule } from "@/features/alerts/types";

type RuleMeta = {
  title: string;
  describe: (value: number) => string;
  unit: string;
  min: number;
  max: number;
  step: number;
  icon: LucideIcon;
  tone: string;
  needsGoals?: boolean;
};

export const RULE_ORDER: AlertRule[] = ["trafficDrop", "trackingStopped", "trafficSpike", "goalBehind", "formsQuiet"];

export const RULE_META: Record<AlertRule, RuleMeta> = {
  trafficDrop: {
    title: "Traffic drop",
    describe: (v) => `Pageviews in the last 24 hours fall ${v}% or more below the same time last week.`,
    unit: "%",
    min: 10,
    max: 95,
    step: 5,
    icon: TrendingDown,
    tone: "red",
  },
  trackingStopped: {
    title: "Tracking stopped",
    describe: (v) => `A site sends no events at all for ${v} ${v === 1 ? "hour" : "hours"}.`,
    unit: "hours",
    min: 1,
    max: 72,
    step: 1,
    icon: SatelliteDish,
    tone: "orange",
  },
  trafficSpike: {
    title: "Traffic spike",
    describe: (v) => `Pageviews in the last 24 hours rise ${v}% or more above the same time last week.`,
    unit: "%",
    min: 25,
    max: 1000,
    step: 25,
    icon: TrendingUp,
    tone: "teal",
  },
  goalBehind: {
    title: "Goal behind pace",
    describe: (v) => `A goal is on course to miss its target by ${v}% or more, checked from a third of the way into its period.`,
    unit: "%",
    min: 5,
    max: 90,
    step: 5,
    icon: Flag,
    tone: "blue",
    needsGoals: true,
  },
  formsQuiet: {
    title: "Forms gone quiet",
    describe: (v) => `Your lead capture forms get no submissions for ${v} ${v === 1 ? "day" : "days"}.`,
    unit: "days",
    min: 1,
    max: 30,
    step: 1,
    icon: Inbox,
    tone: "violet",
  },
};

export const CHANNEL_ORDER: AlertChannel[] = ["email", "telegram", "whatsapp"];

export const CHANNEL_META: Record<AlertChannel, { label: string; icon: LucideIcon; setupApp?: string }> = {
  email: { label: "Email", icon: Mail },
  telegram: { label: "Telegram", icon: Send, setupApp: "telegram" },
  whatsapp: { label: "WhatsApp", icon: MessageCircle, setupApp: "whatsapp" },
};

export function checkCadence(hours: number): string {
  return hours === 1 ? "every hour" : `every ${hours} hours`;
}
