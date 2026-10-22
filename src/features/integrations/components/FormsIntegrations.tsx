import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Anchor, Group, Text } from "@mantine/core";
import { useSaveFormsWebhookMutation } from "@/app/store";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import { notify, notifyError } from "@/shared/lib/notify";
import type { useFormsIntegrations } from "../hooks/useFormsIntegrations";
import { useGoogleConnect } from "../hooks/useGoogleConnect";
import { CATEGORY_HINT, CATEGORY_TITLE, isPaymentProvider } from "../lib/catalog";
import { isFiltered, matchesFilter, tileState, type ConnectionFilter } from "../lib/filter";
import { IntegrationTileCard } from "./IntegrationTileCard";
import { AppConnectModal } from "./AppConnectModal";
import { GoogleCalendarModal } from "./GoogleCalendarModal";
import { GoogleSheetsModal } from "./GoogleSheetsModal";
import { PaymentsModal } from "./payments/PaymentsModal";
import { TelegramModal } from "./telegram/TelegramModal";
import { WhatsAppModal } from "./whatsapp/WhatsAppModal";
import { usePermissions } from "@/features/workspace/context";
import type { IntegrationTile, PaymentProvider } from "../types";

const FORMS_TITLE = "Form apps";
const FORMS_HINT = "Email, payments, calendar and chat apps your lead forms and reports use.";

interface Props {
  workspaceId: string | null;
  lockedReason?: string;
  integrations: ReturnType<typeof useFormsIntegrations>;
  filter: ConnectionFilter;
}

export function FormsIntegrations({ workspaceId, lockedReason, integrations, filter }: Props) {
  const [params, setParams] = useSearchParams();
  const [openAppId, setOpenAppId] = useState<string | null>(null);
  const [payProvider, setPayProvider] = useState<PaymentProvider | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [sheetsOpen, setSheetsOpen] = useState(false);
  const [telegramOpen, setTelegramOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const { canAdmin } = usePermissions();
  const [saveWebhook, webhookState] = useSaveFormsWebhookMutation();
  const calendar = useGoogleConnect("calendar", workspaceId ?? "", integrations.calendar, integrations.refetchCalendar);
  const sheets = useGoogleConnect("sheets", workspaceId ?? "", integrations.sheets, integrations.refetchSheets);
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
    else if (tile.kind === "sheets") setSheetsOpen(true);
    else if (tile.kind === "telegram") setTelegramOpen(true);
    else if (tile.kind === "whatsapp") setWhatsappOpen(true);
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
      busy={
        tile.kind === "webhook"
          ? webhookState.isLoading
          : tile.kind === "calendar"
            ? calendar.busy
            : tile.kind === "sheets"
              ? sheets.busy
              : false
      }
      onOpen={open}
    />
  );

  const dialogs = workspaceId && (
    <>
      <AppConnectModal
        app={openApp}
        workspaceId={workspaceId}
        refreshing={integrations.appsFetching}
        onClose={() => setOpenAppId(null)}
        onRefresh={() => void integrations.refetchApps()}
      />
      <PaymentsModal workspaceId={workspaceId} provider={payProvider} onClose={() => setPayProvider(null)} />
      <TelegramModal
        opened={telegramOpen}
        workspaceId={workspaceId}
        status={integrations.telegram}
        onClose={() => setTelegramOpen(false)}
      />
      <WhatsAppModal
        opened={whatsappOpen}
        workspaceId={workspaceId}
        canManage={canAdmin}
        status={integrations.whatsapp}
        onClose={() => setWhatsappOpen(false)}
      />
      <GoogleCalendarModal
        opened={calendarOpen && Boolean(integrations.calendar?.configured)}
        status={integrations.calendar}
        busy={calendar.busy}
        refreshing={integrations.calendarFetching}
        onRefresh={() => void integrations.refetchCalendar()}
        onClose={() => setCalendarOpen(false)}
        onConnect={() => void calendar.connect()}
        onDisconnect={() => calendar.disconnect(() => setCalendarOpen(false))}
      />
      <GoogleSheetsModal
        opened={sheetsOpen && Boolean(integrations.sheets?.configured)}
        status={integrations.sheets}
        busy={sheets.busy}
        refreshing={integrations.sheetsFetching}
        onRefresh={() => void integrations.refetchSheets()}
        onClose={() => setSheetsOpen(false)}
        onConnect={() => void sheets.connect()}
        onDisconnect={() => sheets.disconnect(() => setSheetsOpen(false))}
      />
    </>
  );

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

  if (loading) return null;

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
