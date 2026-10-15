import type { Dispatch, Ref, SetStateAction } from "react";
import { Mail, MessageCircle, Send, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { TelegramDelivery } from "../telegram/TelegramDelivery";
import { EditorSection, SettingRow, SettingsGroup, type FormSection } from "./EditorSection";
import { EmailRecipients } from "./EmailRecipients";
import reportClasses from "../Reports.module.css";
import classes from "./Editor.module.css";

interface Props {
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  workspaceId: string;
  emailInput: string;
  setEmailInput: (v: string) => void;
  addEmail: () => void;
  removeEmail: (email: string) => void;
  ownerEmail: string;
  ownerMobile: string;
  wa?: WhatsAppStatus;
  waReady: boolean;
  waEntitled: boolean;
  sectionRef: (id: FormSection) => Ref<HTMLElement>;
}

export function DeliverySection({
  draft, setDraft, workspaceId, emailInput, setEmailInput, addEmail, removeEmail,
  ownerEmail, ownerMobile, wa, waReady, waEntitled, sectionRef,
}: Props) {
  const { t } = useTranslation();
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const waHint = !waEntitled
    ? t("reports.waNotEntitled")
    : !wa?.configured
      ? t("reports.waNotConfigured")
      : wa.status === "connected"
        ? t("reports.waConnected")
        : t("reports.waUnavailable");

  return (
    <EditorSection
      id="delivery"
      title={t("reports.sectionDelivery")}
      description={t("reports.sectionDeliveryDesc")}
      sectionRef={sectionRef}
    >
      <SettingsGroup>
        <SettingRow
          icon={Mail}
          label={t("reports.channelEmail")}
          hint={t("reports.channelEmailHint")}
          checked={draft.emailChannel}
          onChange={(emailChannel) => set({ emailChannel })}
        >
          <div className={classes.detailHint}>{t("reports.alsoSendToDesc")}</div>
          <EmailRecipients
            ownerEmail={ownerEmail}
            recipients={draft.recipients}
            emailInput={emailInput}
            setEmailInput={setEmailInput}
            addEmail={addEmail}
            removeEmail={removeEmail}
          />
        </SettingRow>

        <SettingRow
          icon={MessageCircle}
          label={t("reports.channelWhatsApp")}
          hint={waHint}
          checked={draft.whatsappChannel}
          disabled={!waReady || !waEntitled}
          onChange={(whatsappChannel) => set({ whatsappChannel })}
        >
          {ownerMobile ? (
            <div className={classes.waRow}>
              <Smartphone size={15} className={classes.recipientIcon} />
              <span className={classes.grow}>+{ownerMobile}</span>
              <span className={reportClasses.recipientTag}>{t("reports.waOnlyYouShort")}</span>
            </div>
          ) : (
            <div className={classes.waMissing}>{t("reports.waNoticeNoNumber")}</div>
          )}
        </SettingRow>

        <SettingRow
          icon={Send}
          label={t("reports.channelTelegram")}
          hint={t("reports.channelTelegramShort")}
          checked={draft.telegramChannel}
          onChange={(telegramChannel) => set({ telegramChannel })}
        >
          {workspaceId && (
            <>
              <div className={classes.detailHint}>{t("reports.telegramChatsHint")}</div>
              <TelegramDelivery
                workspaceId={workspaceId}
                selected={draft.telegramChatIds}
                onSelect={(telegramChatIds) => set({ telegramChatIds })}
              />
            </>
          )}
        </SettingRow>
      </SettingsGroup>
    </EditorSection>
  );
}
