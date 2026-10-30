import { Anchor, Button, Text } from "@mantine/core";
import { LockOpen, Power } from "lucide-react";
import { Link } from "react-router-dom";
import type { WorkspaceAppId } from "@/shared/types";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { useToggleWorkspaceApp } from "@/features/integrations/hooks/useToggleWorkspaceApp";
import { useAppUnlock } from "@/features/integrations/hooks/useAppUnlock";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";
import { QuantalogAppFeatures } from "./QuantalogAppFeatures";
import { AppUnlockCheckout } from "./AppUnlockCheckout";
import classes from "./QuantalogAppGate.module.css";
import { appsPath } from "@/features/integrations/lib/appsPath";

export function QuantalogAppGate({ app }: { app: WorkspaceAppId }) {
  const info = WORKSPACE_APP_INFO[app];
  const toggle = useToggleWorkspaceApp(app);
  const unlock = useAppUnlock(app);

  return (
    <section className={classes.gate}>
      <div className={classes.head}>
        <BrandMark id={info.tileId} size={64} />
        <Text className={classes.title}>{info.name}</Text>
        <Text c="dimmed" className={classes.lead}>
          {info.description}
        </Text>
        {toggle.canManage && unlock.locked ? (
          <>
            <Button
              size="md"
              leftSection={<LockOpen size={16} />}
              loading={unlock.buying}
              disabled={unlock.price === null}
              onClick={unlock.openCheckout}
            >
              {unlock.priceLabel ? `Unlock for ${unlock.priceLabel}` : "Unlock"}
            </Button>
            <Text size="sm" c="dimmed">
              One-time payment for this workspace. No subscription.
            </Text>
          </>
        ) : toggle.canManage ? (
          <Button size="md" leftSection={<Power size={16} />} loading={toggle.saving} onClick={() => void toggle.toggle(true)}>
            Enable {info.navLabel}
          </Button>
        ) : (
          <Text size="sm" c="dimmed">
            Ask a workspace admin to {unlock.locked ? "unlock" : "enable"} it in{" "}
            <Anchor component={Link} to={appsPath(info.tileId)} size="sm">
              Apps
            </Anchor>
            .
          </Text>
        )}
      </div>
      <QuantalogAppFeatures info={info} />
      {unlock.locked && unlock.price !== null && (
        <AppUnlockCheckout
          info={info}
          opened={unlock.checkoutOpen}
          price={unlock.price}
          currency={unlock.currency}
          busy={unlock.buying}
          canManage={toggle.canManage}
          onClose={unlock.closeCheckout}
          onConfirm={(request) => void unlock.buy(request)}
        />
      )}
    </section>
  );
}
