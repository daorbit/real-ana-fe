import { Skeleton } from "@mantine/core";
import classes from "./BioSkeleton.module.css";

const BUTTONS = [0, 1, 2, 3];

export function PhoneSkeleton() {
  return (
    <div className={classes.phone} aria-hidden>
      <div className={classes.screen}>
        <Skeleton circle height={72} />
        <Skeleton height={14} width="52%" radius="xl" mt={14} />
        <Skeleton height={10} width="70%" radius="xl" mt={8} />
        <div className={classes.phoneButtons}>
          {BUTTONS.map((i) => (
            <Skeleton key={i} height={42} radius={10} />
          ))}
        </div>
        <div className={classes.phoneSocials}>
          {BUTTONS.map((i) => (
            <Skeleton key={i} circle height={22} />
          ))}
        </div>
      </div>
    </div>
  );
}
