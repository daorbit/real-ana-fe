import { Link } from "react-router-dom";
import { Button, Card, ThemeIcon } from "@mantine/core";
import { Flame } from "lucide-react";
import { WORKSPACES_PATH } from "@/features/workspace/paths";
import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

export function HeatmapSetup({ enabled }: { enabled: boolean }) {
  return (
    <Card withBorder radius="lg" padding="lg">
      <div className={classes.setup}>
        <ThemeIcon variant="light" color="gray" size="lg" radius="md">
          <Flame size={18} />
        </ThemeIcon>
        {enabled ? (
          <span className={classes.setupText}>
            No heatmap data in this range yet. Clicks and scroll depth show up here as visitors use your pages.
          </span>
        ) : (
          <>
            <span className={classes.setupText}>
              Heatmaps are off. Turn on “Capture heatmap data” in your site&apos;s tracking snippet, then update the
              snippet on your site.
            </span>
            <Button component={Link} to={WORKSPACES_PATH} variant="default" size="xs">
              Open tracking snippet
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
