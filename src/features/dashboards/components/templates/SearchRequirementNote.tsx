import { skipToken } from "@reduxjs/toolkit/query";
import { CircleCheck, PlugZap, Unplug } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import { useGetSearchConsoleStatusQuery } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import classes from "@/features/dashboards/components/templates/Templates.module.css";

export function SearchRequirementNote({ count }: { count: number }) {
  const { active } = useWorkspace();
  const { data: status } = useGetSearchConsoleStatusQuery(active?._id ?? skipToken);
  const widgets = `${count} Google Search widget${count === 1 ? "" : "s"}`;

  let tone: "ok" | "warn" | "info" = "info";
  let Icon = PlugZap;
  let text = `Includes ${widgets}. Connect Google Search after creating it — each widget shows you how.`;

  if (status && !status.configured) {
    text = `Includes ${widgets}, but Google Search isn't available on this deployment. Those widgets will stay empty.`;
  } else if (status?.connection?.status === "active") {
    tone = "ok";
    Icon = CircleCheck;
    text = `Includes ${widgets}. Google Search is connected${status.connection.googleEmail ? ` as ${status.connection.googleEmail}` : ""}, so they fill in straight away.`;
  } else if (status?.connection) {
    tone = "warn";
    Icon = Unplug;
    text = `Includes ${widgets}. Your Google connection needs reconnecting — the dashboard will prompt you.`;
  }

  return (
    <div className={classes.requirement} data-tone={tone}>
      <span className={classes.requirementMark}><GoogleMark size={14} /></span>
      <span className={classes.requirementText}>{text}</span>
      <Icon size={15} className={classes.requirementIcon} />
    </div>
  );
}
