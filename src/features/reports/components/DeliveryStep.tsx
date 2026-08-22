import {
  Stack, Text, Group, Button, Badge, TextInput, Checkbox, Alert, ActionIcon,
} from "@mantine/core";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";

/** Step two: which channels carry the report, and who else receives it. */
export function DeliveryStep({
  draft,
  setDraft,
  emailInput,
  setEmailInput,
  addEmail,
  removeEmail,
  wa,
  waReady,
  waEntitled,
  ownerMobile,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  addEmail: () => void;
  removeEmail: (email: string) => void;
  wa?: WhatsAppStatus;
  waReady: boolean;
  waEntitled: boolean;
  ownerMobile: string;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb={4}>{t("reports.deliverBy")}</Text>
        <Text size="xs" c="dimmed" mb={8}>{t("reports.deliverByDesc")}</Text>
        <Stack gap={8}>
          <Checkbox
            label={t("reports.channelEmail")}
            checked={draft.emailChannel}
            onChange={(e) => setDraft({ ...draft, emailChannel: e.currentTarget.checked })}
          />
          <Checkbox
            label={t("reports.channelWhatsApp")}
            disabled={!waReady || !waEntitled}
            // The platform's own paired number is an implementation detail, not
            // something a customer needs on screen — what matters is where the
            // message lands, which the notice below states.
            //
            // The plan check comes first: to someone on Free, "temporarily
            // unavailable" would promise a channel that upgrading is the only
            // way to get.
            description={
              !waEntitled
                ? t("reports.waNotEntitled")
                : !wa?.configured
                  ? t("reports.waNotConfigured")
                  : wa.status === "connected"
                    ? t("reports.waConnected")
                    : t("reports.waUnavailable")
            }
            checked={draft.whatsappChannel}
            onChange={(e) => setDraft({ ...draft, whatsappChannel: e.currentTarget.checked })}
          />
        </Stack>
      </div>

      {draft.whatsappChannel && (
        <Alert color="teal" radius="md" p="xs" icon={<MessageCircle size={15} />}>
          <Text size="xs">
            {ownerMobile
              ? t("reports.waNoticeWithNumber", { phone: ownerMobile })
              : t("reports.waNoticeNoNumber")}
          </Text>
        </Alert>
      )}

      <div>
        <Text size="sm" fw={500} mb={4}>{t("reports.alsoSendTo")}</Text>
        <Text size="xs" c="dimmed" mb={8}>{t("reports.alsoSendToDesc")}</Text>
        <Group gap="xs" mb={draft.recipients.length ? "xs" : 0}>
          <TextInput
            style={{ flex: 1 }}
            placeholder={t("reports.emailPlaceholder")}
            value={emailInput}
            onChange={(e) => setEmailInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addEmail();
              }
            }}
          />
          <Button variant="light" onClick={addEmail}>{t("reports.add")}</Button>
        </Group>
        <Group gap={6}>
          {draft.recipients.map((email) => (
            <Badge
              key={email}
              variant="light"
              rightSection={
                <ActionIcon
                  size="xs"
                  variant="transparent"
                  color="gray"
                  onClick={() => removeEmail(email)}
                >
                  ×
                </ActionIcon>
              }
            >
              {email}
            </Badge>
          ))}
        </Group>
      </div>
    </Stack>
  );
}
