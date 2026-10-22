import { useMemo } from "react";
import { useDemo } from "@/features/demo/context";
import type { WorkspaceAppId } from "@/shared/types";
import { useWorkspace } from "./context";

export type EnabledApps = Record<WorkspaceAppId, boolean>;

export function useWorkspaceApps(): EnabledApps {
  const { active } = useWorkspace();
  const { demo } = useDemo();
  const apps = active?.apps;
  const on = (id: WorkspaceAppId) => demo || Boolean(apps?.[id]?.enabled);
  const compare = on("compare");
  const goals = on("goals");
  const notes = on("notes");
  const reviews = on("reviews");
  const links = on("links");
  const media = on("media");
  const alerts = on("alerts");
  const popups = on("popups");
  const publicDashboard = on("publicDashboard");
  const seoReports = on("seoReports");
  const bio = on("bio");
  return useMemo(
    () => ({ compare, goals, notes, reviews, links, media, alerts, popups, publicDashboard, seoReports, bio }),
    [compare, goals, notes, reviews, links, media, alerts, popups, publicDashboard, seoReports, bio],
  );
}
