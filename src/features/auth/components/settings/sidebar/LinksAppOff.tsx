import { Anchor } from "@mantine/core";
import { Link } from "react-router-dom";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";
import { appsPath } from "@/features/integrations/lib/appsPath";
import { SidebarCard } from "./SidebarCard";
import classes from "./Sidebar.module.css";

const INFO = WORKSPACE_APP_INFO.links;

export function LinksAppOff() {
  return (
    <SidebarCard title="Custom links" description={INFO.tagline}>
      <div className={classes.empty}>
        <BrandMark id={INFO.tileId} size={28} />
        <span>
          Get {INFO.name} in{" "}
          <Anchor component={Link} to={appsPath(INFO.tileId)} size="sm">
            Apps
          </Anchor>{" "}
          to add your team&apos;s tools to the sidebar.
        </span>
      </div>
    </SidebarCard>
  );
}
