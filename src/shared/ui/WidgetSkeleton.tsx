import { Brick } from "@/shared/ui/Bricks";

export function WidgetSkeleton({ bare = false }: { bare?: boolean }) {
  return <Brick height={bare ? 96 : 220} />;
}
