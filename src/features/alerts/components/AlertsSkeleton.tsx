import { Box } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import classes from "@/features/alerts/components/Alerts.module.css";

export function AlertsSkeleton() {
  return (
    <>
      <Box mb={18}>
        <PanelSkeleton height={150} />
      </Box>
      <div className={classes.layout}>
        <PanelSkeleton height={520} />
        <div className={classes.side}>
          <PanelSkeleton height={240} />
          <PanelSkeleton height={260} />
        </div>
      </div>
    </>
  );
}
