import { useEffect, useMemo, useRef } from "react";
import { useComputedColorScheme } from "@mantine/core";
import { FolderOpen, ReceiptText } from "lucide-react";
import { AppShell } from "@/app/AppShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useWorkspace } from "@/features/workspace/context";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { useAuth } from "@/features/auth/context";
import { QuantalogAppGate } from "@/features/integrations/components/quantalogApps/QuantalogAppGate";
import { useTitle } from "@/shared/lib/useTitle";
import { useHostFrameToken } from "@/shared/hooks/useHostFrameToken";
import { useEmbeddedPlanLimit } from "@/features/leadCapture/useEmbeddedPlanLimit";
import { useFrameUnreadCount } from "@/features/leadCapture/useFrameUnreadCount";
import { INVOICES_APP_BASE, invoicesAppUrl } from "../lib/invoicesApp";
import classes from "./Invoices.module.css";

export default function Invoices() {
  useTitle("Invoices");
  const { active } = useWorkspace();
  const { isDemo } = useAuth();
  const { invoicing: on } = useWorkspaceApps();
  const colorScheme = useComputedColorScheme("light");
  const configured = Boolean(INVOICES_APP_BASE);
  const workspaceId = isDemo || !configured || !on ? null : active?._id;

  useEffect(() => {
    if (!workspaceId) return;
    document.body.dataset.page = "invoices";
    return () => {
      delete document.body.dataset.page;
    };
  }, [workspaceId]);

  const bootToken = useHostFrameToken(workspaceId, "invoices-token", INVOICES_APP_BASE);

  const src = useMemo(() => {
    if (!workspaceId || bootToken === undefined) return null;
    return invoicesAppUrl(workspaceId, colorScheme, bootToken);
  }, [workspaceId, colorScheme, bootToken]);

  if (isDemo || !configured) {
    return (
      <AppShell>
        <EmptyState
          icon={ReceiptText}
          title="Invoicing isn't in the demo"
          description="Sign up to send quotations and invoices to your leads, right inside Quantalog."
        />
      </AppShell>
    );
  }

  if (!active?._id) {
    return (
      <AppShell>
        <EmptyState
          icon={FolderOpen}
          title="No workspace selected"
          description="Pick a workspace from the switcher to manage its invoices."
          action={{ label: "Go to workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  if (!on) {
    return (
      <AppShell>
        <QuantalogAppGate app="invoicing" />
      </AppShell>
    );
  }

  return <AppShell>{src ? <InvoicesFrame src={src} /> : <div className={classes.frame} />}</AppShell>;
}

function InvoicesFrame({ src }: { src: string }) {
  useEmbeddedPlanLimit(INVOICES_APP_BASE);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const sendUnreadCount = useFrameUnreadCount(frameRef, INVOICES_APP_BASE);
  return (
    <iframe
      ref={frameRef}
      key={src}
      src={src}
      title="Invoices"
      className={classes.frame}
      allow="clipboard-write"
      onLoad={() => sendUnreadCount()}
    />
  );
}
