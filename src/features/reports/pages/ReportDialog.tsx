import { useCallback, useEffect, useRef } from "react";
import { ActionIcon, Button, Modal } from "@mantine/core";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Site, ShareState, WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyLabel, nextRunLabel } from "@/features/reports/pages/utils";
import { ReportForm, type FormSection } from "@/features/reports/components/ReportForm";
import { EmailPreview } from "@/features/reports/components/EmailPreview";
import classes from "@/features/reports/components/Reports.module.css";

/**
 * The create/edit screen.
 *
 * Full-screen, with the form on the left and the email a recipient will get on
 * the right, updating as the form changes. The whole form is one page — no
 * wizard — and Save sits in the top bar, so it is reachable from anywhere.
 *
 * Presentational: the draft and every action are passed in from `hooks.tsx`,
 * which also owns the validation. A failed check names a section; this file
 * scrolls to it.
 */
export function ReportDialog({
  opened,
  onClose,
  editingId,
  draft,
  setDraft,
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
  workspace,
}: {
  opened: boolean;
  onClose: () => void;
  editingId: string | null;
  draft: Draft;
  setDraft: (d: Draft) => void;
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
  workspace: string;
}) {
  const { t } = useTranslation();
  const sections = useRef<Partial<Record<FormSection, HTMLElement | null>>>({});
  const sectionRef = useCallback(
    (id: FormSection) => (el: HTMLElement | null) => {
      sections.current[id] = el;
    },
    [],
  );

  useEffect(() => {
    if (!focusTick) return;
    sections.current[tab as FormSection]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [tab, focusTick]);

  const recipients = 1 + draft.recipients.length;
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
      styles={{
        content: { display: "flex", flexDirection: "column", border: "none" },
        body: { flex: 1, minHeight: 0, overflow: "hidden" },
      }}
    >
      <div className={classes.editor}>
        <header className={classes.topbar}>
          <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label={t("common.cancel")}>
            <X size={18} />
          </ActionIcon>
          <div className={classes.topTitle}>
            <div className={classes.topName}>
              {editingId ? t("reports.dialogEditTitle") : t("reports.dialogNewTitle")}
              {draft.name.trim() && ` · ${draft.name.trim()}`}
            </div>
            <div className={classes.topSummary}>{summary}</div>
          </div>
          <Button variant="default" onClick={onClose} visibleFrom="xs">
            {t("common.cancel")}
          </Button>
          <Button loading={saving} onClick={submit}>
            {editingId ? t("common.save") : t("reports.createReport")}
          </Button>
        </header>

        <div className={classes.split}>
          <div className={classes.formPane}>
            <ReportForm
              draft={draft}
              setDraft={setDraft}
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
          <aside className={classes.previewPane}>
            <EmailPreview
              draft={draft}
              sites={sites}
              ownerEmail={ownerEmail}
              shareEnabled={Boolean(share?.enabled)}
              workspace={workspace}
            />
          </aside>
        </div>
      </div>
    </Modal>
  );
}
