import { Skeleton } from "@mantine/core";
import classes from "./Campaigns.module.css";
import cards from "./CampaignCard.module.css";

const CARDS = [0, 1, 2];

export function CampaignsSkeleton() {
  return (
    <div className={classes.page} aria-busy>
      <Skeleton height={112} radius="lg" />
      <div className={classes.stack}>
        <Skeleton height={34} width={280} radius="md" />
        <div className={cards.grid}>
          {CARDS.map((key) => (
            <Skeleton key={key} height={290} radius="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
