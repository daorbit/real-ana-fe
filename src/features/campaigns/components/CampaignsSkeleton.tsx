import { Skeleton } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import classes from "./Campaigns.module.css";
import cards from "./CampaignCard.module.css";

const CARDS = [0, 1, 2];

export function CampaignsSkeleton() {
  return (
    <div className={classes.page} aria-busy>
      <PanelSkeleton height={112} />
      <div className={classes.stack}>
        <Skeleton height={34} width={280} radius="md" />
        <div className={cards.grid}>
          {CARDS.map((key) => (
            <PanelSkeleton key={key} height={290} />
          ))}
        </div>
      </div>
    </div>
  );
}
