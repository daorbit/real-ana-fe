import { SwitchVisual } from "@/shared/ui/SwitchOverlay";
import { Brick, Bricks } from "@/shared/ui/Bricks";
import { brickRows, type BrickRow } from "@/shared/lib/brickRows";

const WORKSPACES: BrickRow[] = [{ height: 64 }, { height: 206 }, { height: 190, cols: 3 }];

const SOCIAL_POSTS = brickRows(4, 132);

const REPORTS: BrickRow[] = [{ height: 132, cols: 3 }, ...brickRows(3, 112)];

const PLANS_GRID: BrickRow[] = [{ height: 48 }, { height: 560, cols: 3 }];

const BILLING: BrickRow[] = [{ height: 120 }, { height: 44 }, ...PLANS_GRID];

const BRANDING: BrickRow[] = [{ height: 72 }, { height: 320, split: "lead" }, { height: 220, split: "lead" }];

const FLOW_GRAPH: BrickRow[] = [
  { height: 92, cols: 3 },
  { height: 92, cols: 3 },
  { height: 92, cols: 3 },
];

export function PanelSkeleton({ height }: { height: number }) {
  return <Brick height={height} />;
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return <Brick height={height} />;
}

export function FlowGraphSkeleton() {
  return <Bricks rows={FLOW_GRAPH} label="Loading visitor flow" />;
}

export function WorkspacesSkeleton() {
  return <Bricks rows={WORKSPACES} label="Loading workspaces" />;
}

export function SocialPostsSkeleton() {
  return <Bricks rows={SOCIAL_POSTS} label="Loading posts" />;
}

export function ReportsSkeleton() {
  return <Bricks rows={REPORTS} label="Loading reports" />;
}

export function PlansGridSkeleton() {
  return <Bricks rows={PLANS_GRID} label="Loading plans" />;
}

export function BillingSkeleton() {
  return <Bricks rows={BILLING} label="Loading billing" />;
}

export function BrandingSkeleton() {
  return <Bricks rows={BRANDING} label="Loading branding" />;
}

export function AppBootSkeleton() {
  return <SwitchVisual sublabel="Restoring your session…" />;
}
