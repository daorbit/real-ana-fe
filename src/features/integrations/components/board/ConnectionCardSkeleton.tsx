import { Brick } from "@/shared/ui/Bricks";

const CARD_HEIGHT = 220;

export function ConnectionCardSkeleton() {
  return <Brick height={CARD_HEIGHT} />;
}

export function ConnectionGridSkeleton({ count }: { count: number }) {
  return (
    <div className="connection-grid" aria-busy="true" aria-label="Loading connections">
      {Array.from({ length: count }, (_, index) => (
        <ConnectionCardSkeleton key={index} />
      ))}
    </div>
  );
}
