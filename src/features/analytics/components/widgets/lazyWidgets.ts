import { lazy } from "react";

export const WorldMap = lazy(() =>
  import("@/shared/ui/WorldMap").then((m) => ({ default: m.WorldMap })),
);

export const SearchWidget = lazy(() =>
  import("@/features/searchConsole/widgets/SearchWidget").then((m) => ({ default: m.SearchWidget })),
);

export const TargetsWidget = lazy(() =>
  import("@/features/goals/components/TargetsWidget").then((m) => ({ default: m.TargetsWidget })),
);

export const MyTasksWidget = lazy(() =>
  import("@/features/tasks/widgets/MyTasksWidget").then((m) => ({ default: m.MyTasksWidget })),
);

export const LeadsWidget = lazy(() =>
  import("@/features/leadCapture/widgets/LeadsWidget").then((m) => ({ default: m.LeadsWidget })),
);

export const InvoicesWidget = lazy(() =>
  import("@/features/invoices/widgets/InvoicesWidget").then((m) => ({ default: m.InvoicesWidget })),
);

export const SeoScoreCard = lazy(() =>
  import("@/features/seo/components/SeoScoreCard").then((m) => ({ default: m.SeoScoreCard })),
);
