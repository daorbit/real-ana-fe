import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Anchor, Group, Skeleton, Text } from "@mantine/core";
import { useSaveFormsWebhookMutation } from "@/app/store";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import { notify, notifyError } from "@/shared/lib/notify";
import type { useFormsIntegrations } from "../hooks/useFormsIntegrations";
import { useCalendarConnect } from "../hooks/useCalendarConnect";
import { CATEGORY_HINT, CATEGORY_TITLE, isPaymentProvider } from "../lib/catalog";
import { isFiltered, matchesFilter, tileState, type ConnectionFilter } from "../lib/filter";
import { IntegrationTileCard } from "./IntegrationTileCard";
import { AppConnectModal } from "./AppConnectModal";
import { GoogleCalendarModal } from "./GoogleCalendarModal";
import { PaymentsModal } from "./payments/PaymentsModal";
import type { IntegrationTile, PaymentProvider } from "../types";

const SKELETON_TILES = 3;
const FORMS_TITLE = "Form apps";
const FORMS_HINT = "Email, payments, calendar and chat apps your lead forms use.";

interface Props {
  workspaceId: string | null;
  lockedReason?: string;
  integrations: ReturnType<typeof useFormsIntegrations>;
  filter: ConnectionFilter;
  flat?: boolean;
}

export function FormsIntegrations({ workspaceId, lockedReason, integrations, filter, flat }: Props) {
  const [params, setParams] = useSearchParams();
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const [payProvider, setPayProvider] = useState<PaymentProvider | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [saveWebhook, webhookState] = useSaveFormsWebhookMutation();
  const calendar = useCalendarConnect(workspaceId ?? "", integrations.refetchCalendar);
  const { failed, error, loading, sections } = integrations;
  const requestedApp = params.get("app");

  useEffect(() => {
    if (failed) notifyError(error, "Could not load your form apps.");
  }, [failed, error]);

  const openApp = useMemo(
    () => integrations.apps?.find((app) => app.id === openAppId) ?? null,
    [integrations.apps, openAppId],
  );

  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          tiles: section.tiles.filter((tile) =>
            matchesFilter(
              { name: tile.name, description: tile.description, group: CATEGORY_TITLE[section.category], state: tileState(tile) },
              filter,
            ),
          ),
        }))
        .filter((section) => section.tiles.length > 0),
    [sections, filter],
  );

  const toggleWebhook = async (enabled: boolean) => {
    if (!workspaceId) return;
    try {
      await saveWebhook({ workspaceId, enabled }).unwrap();
      notify.success(enabled ? "Webhooks are on. Set a URL from any form's Webhook panel." : "Webhooks are off.");
    } catch (e) {
      notifyError(e, "Could not change the webhook setting.");
    }
  };

  const open = (tile: IntegrationTile) => {
    if (tile.kind === "webhook") void toggleWebhook(!tile.enabled);
    else if (tile.kind === "calendar") setCalendarOpen(true);
    else if (tile.kind === "payment" && isPaymentProvider(tile.id)) setPayProvider(tile.id);
    else setOpenAppId(tile.id);
  };

  useEffect(() => {
    if (!requestedApp || (loading && !lockedReason)) return;
    const tile = lockedReason ? undefined : sections.flatMap((section) => section.tiles).find((t) => t.id === requestedApp);
    if (tile && tile.kind !== "webhook") open(tile);
    const next = new URLSearchParams(params);
    next.delete("app");
    setParams(next, { replace: true });
  });

  const renderTile = (tile: IntegrationTile) => (
    <IntegrationTileCard
      key={tile.id}
      tile={tile}
      busy={tile.kind === "webhook" ? webhookState.isLoading : tile.kind === "calendar" ? calendar.busy : false}
      onOpen={open}
    />
  );

  const dialogs = workspaceId && (
    <>
      <AppConnectModal app={openApp} workspaceId={workspaceId} onClose={() => setOpenAppId(null)} />
      <PaymentsModal workspaceId={workspaceId} provider={payProvider} onClose={() => setPayProvider(null)} />
      <GoogleCalendarModal
        opened={calendarOpen && Boolean(integrations.calendar?.configured)}
        status={integrations.calendar}
        busy={calendar.busy}
        onClose={() => setCalendarOpen(false)}
        onConnect={() => void calendar.connect()}
        onDisconnect={async () => {
          if (await calendar.disconnect()) setCalendarOpen(false);
        }}
      />
    </>
  );

  if (flat) {
    if (lockedReason || failed) return null;
    if (loading) {
      return (
        <>
          {Array.from({ length: SKELETON_TILES }, (_, index) => (
            <Skeleton key={index} height={196} radius="md" />
          ))}
        </>
      );
    }
    return (
      <>
        {visibleSections.flatMap((section) => section.tiles).map(renderTile)}
        {dialogs}
      </>
    );
  }

  if (lockedReason) {
    if (isFiltered(filter)) return null;
    return (
      <ConnectionGroup title={FORMS_TITLE} hint={FORMS_HINT}>
        <Text size="sm" c="dimmed">
          {lockedReason}
        </Text>
      </ConnectionGroup>
    );
  }

  if (loading) {
    return (
      <ConnectionGroup title={FORMS_TITLE} hint="Loading the apps connected to your forms.">
        {Array.from({ length: SKELETON_TILES }, (_, index) => (
          <Skeleton key={index} height={196} radius="md" />
        ))}
      </ConnectionGroup>
    );
  }

  if (failed) {
    return (
      <ConnectionGroup title={FORMS_TITLE} hint={FORMS_HINT}>
        <Group gap={6}>
          <Text size="sm" c="dimmed">
            Your form apps could not be loaded.
          </Text>
          <Anchor component="button" type="button" size="sm" onClick={integrations.refetchAll}>
            Try again
          </Anchor>
        </Group>
      </ConnectionGroup>
    );
  }

  return (
    <>
      {visibleSections.map((section) => (
        <ConnectionGroup key={section.category} title={CATEGORY_TITLE[section.category]} hint={CATEGORY_HINT[section.category]}>
          {section.tiles.map(renderTile)}
        </ConnectionGroup>
      ))}
      {dialogs}
    </>
  );
}
