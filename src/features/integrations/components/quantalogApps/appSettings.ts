import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { WorkspaceAppId } from "@/shared/types";

type AppSettings = LazyExoticComponent<ComponentType<{ workspaceId: string }>>;

export const APP_SETTINGS: Partial<Record<WorkspaceAppId, AppSettings>> = {
  publicDashboard: lazy(() =>
    import("@/features/analytics/components/share/analytics/AnalyticsShareTab").then((m) => ({ default: m.AnalyticsShareTab })),
  ),
  seoReports: lazy(() =>
    import("@/features/analytics/components/share/seo/SeoShareTab").then((m) => ({ default: m.SeoShareTab })),
  ),
};
