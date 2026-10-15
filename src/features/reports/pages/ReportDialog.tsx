import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { ActionIcon, Button, Modal, Switch } from "@mantine/core";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Site, ShareState, WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyLabel, nextRunLabel } from "@/features/reports/pages/utils";
import { ReportForm, type FormSection } from "@/features/reports/components/ReportForm";
import classes from "@/features/reports/components/Reports.module.css";
import editorClasses from "@/features/reports/components/editor/Editor.module.css";

export function ReportDialog({
  opened,
  onClose,
  editingId,
  draft,
  setDraft,
  workspaceId,
  emailInput,
  setEmailInput,
  addEmail,
  removeEmail,
  tab,
  focusTick,
  submit,
  saving,
  sites,
  share,
  wa,
  waReady,
  waEntitled,
  ownerEmail,
  ownerMobile,
}: {
  opened: boolean;
  onClose: () => void;
  editingId: string | null;
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  workspaceId: string;
  emailInput: string;
  setEmailInput: (v: string) => void;
  addEmail: () => void;
  removeEmail: (email: string) => void;
  tab: string;
  focusTick: number;
  submit: () => void;
  saving: boolean;
  sites: Site[];
  share?: ShareState;
  wa?: WhatsAppStatus;
  waReady: boolean;
  waEntitled: boolean;
  ownerEmail: string;
  ownerMobile: string;
}) {
  const { t } = useTranslation();
  const sections = useRef<Partial<Record<FormSection, HTMLElement | null>>>({});
  const sectionRef = useCallback(
    (id: FormSection) => (el: HTMLElement | null) => {
      sections.current[id] = el;
    },
    [],
  );

  const jump = useCallback((id: FormSection) => {
    sections.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!focusTick) return;
    jump(tab as FormSection);
  }, [tab, focusTick, jump]);

  const recipients =
    (draft.emailChannel ? 1 + draft.recipients.length : 0) +
    (draft.whatsappChannel ? 1 : 0) +
    (draft.telegramChannel ? draft.telegramChatIds.length : 0);
  const summary = [
    frequencyLabel(draft.frequency),
    draft.enabled ? t("reports.previewNextSend", { when: nextRunLabel(draft.frequency) }) : t("reports.paused"),
    t("reports.recipientCount", { count: recipients }),
  ].join(" · ");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: "fade", duration: 150 }}
      classNames={{ content: classes.modalContent, body: classes.modalBody }}
    >
      <div className={classes.editor}>
        <header className={classes.topbar}>
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label={t("common.cancel")}>
            <X size={18} />
          </ActionIcon>
          <div className={classes.topTitle}>
            <div className={classes.topName}>
              {draft.name.trim() || (editingId ? t("reports.dialogEditTitle") : t("reports.dialogNewTitle"))}
            </div>
            <div className={classes.topSummary}>{summary}</div>
          </div>
          <Switch
            size="sm"
            label={t("reports.activeLabel")}
            checked={draft.enabled}
            onChange={(e) => {
              const enabled = e.currentTarget.checked;
              setDraft((d) => ({ ...d, enabled }));
            }}
            className={classes.topSwitch}
          />
          <Button variant="default" onClick={onClose} visibleFrom="xs">
            {t("common.cancel")}
          </Button>
          <Button loading={saving} onClick={submit}>
            {editingId ? t("common.save") : t("reports.createReport")}
          </Button>
        </header>

        <div className={editorClasses.scroll}>
          <ReportForm
              draft={draft}
              setDraft={setDraft}
              workspaceId={workspaceId}
              sites={sites}
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              addEmail={addEmail}
              removeEmail={removeEmail}
              ownerEmail={ownerEmail}
              ownerMobile={ownerMobile}
              wa={wa}
              waReady={waReady}
              waEntitled={waEntitled}
              share={share}
              sectionRef={sectionRef}
            />
        </div>
      </div>
    </Modal>
  );
}
