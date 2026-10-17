import { Anchor, Button } from "@mantine/core";
import { Power } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { useToggleWorkspaceApp } from "@/features/integrations/hooks/useToggleWorkspaceApp";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";
import { appsPath } from "@/features/integrations/lib/appsPath";
import { SidebarCard } from "./SidebarCard";
import classes from "./Sidebar.module.css";

const INFO = WORKSPACE_APP_INFO.links;

export function LinksAppOff() {
  const app = useToggleWorkspaceApp("links");

  return (
    <SidebarCard title="Custom links" description={INFO.tagline}>
      <div className={classes.empty}>
        <BrandMark id={INFO.tileId} size={28} />
        <span>
          {app.canManage ? (
            <>Turn on {INFO.name} to add your team&apos;s tools to the sidebar.</>
          ) : (
            <>
              {INFO.name} is off. Ask a workspace admin to enable it in{" "}
              <Anchor component={Link} to={appsPath(INFO.tileId)} size="sm">
                Apps
              </Anchor>
              .
            </>
          )}
        </span>
      </div>
      {app.canManage && (
        <Button size="xs" variant="default" radius="md" leftSection={<Power size={14} />} loading={app.saving} onClick={() => void app.toggle(true)}>
          Enable Links
        </Button>
      )}
    </SidebarCard>
  );
}
