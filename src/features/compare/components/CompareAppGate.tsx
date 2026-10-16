import { Anchor, Button, Text } from "@mantine/core";
import { Power } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { QuantalogAppFeatures } from "@/features/integrations/components/quantalogApps/QuantalogAppFeatures";
import { useToggleWorkspaceApp } from "@/features/integrations/hooks/useToggleWorkspaceApp";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";
import classes from "./CompareAppGate.module.css";

const INFO = WORKSPACE_APP_INFO.compare;

export function CompareAppGate() {
  const app = useToggleWorkspaceApp("compare");

  return (
    <section className={classes.gate}>
      <div className={classes.head}>
        <BrandMark id={INFO.tileId} size={64} />
        <Text className={classes.title}>{INFO.name}</Text>
        <Text c="dimmed" className={classes.lead}>
          {INFO.description}
        </Text>
        {app.canManage ? (
          <Button size="md" leftSection={<Power size={16} />} loading={app.saving} onClick={() => void app.toggle(true)}>
            Enable Compare
          </Button>
        ) : (
          <Text size="sm" c="dimmed">
            Ask a workspace admin to enable it in{" "}
            <Anchor component={Link} to={`/app/settings/connections?app=${INFO.tileId}`} size="sm">
              Connections
            </Anchor>
            .
          </Text>
        )}
      </div>
      <QuantalogAppFeatures info={INFO} />
    </section>
  );
}
