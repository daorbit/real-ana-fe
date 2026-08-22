import {
  Text, Group, Button, Modal, ActionIcon, Divider, Box, Badge, Tooltip,
} from "@mantine/core";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Site, ShareState, WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { TAB_ORDER } from "@/features/reports/pages/utils";
import { ReportSteps } from "@/features/reports/components/ReportSteps";
import { ReportPreview } from "@/features/reports/components/ReportPreview";
import { ScheduleStep } from "@/features/reports/components/ScheduleStep";
import { DeliveryStep } from "@/features/reports/components/DeliveryStep";
import { ContentStep } from "@/features/reports/components/ContentStep";

/**
 * The create/edit dialog.
 *
 * Presentational: every piece of state and each action is passed in, so the
 * page owns the draft and this file only decides how it looks. That keeps the
 * validation (which needs to move tabs) in one place rather than split across
 * the boundary.
 *
 * Full-screen with a live preview, matching the share composer — the form is
 * long enough that a centred `size="lg"` box scrolled its own save button out
 * of reach, and none of the choices showed their effect until the first report
 * actually arrived. This file is the shell only; each step and the preview live
 * in `../components`.
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
  setTab,
  tabIndex,
  isLastTab,
  submit,
  saving,
  sites,
  share,
  wa,
  waReady,
  waEntitled,
  ownerMobile,
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
  setTab: (t: string) => void;
  tabIndex: number;
  isLastTab: boolean;
  submit: () => void;
  saving: boolean;
  sites: Site[];
  share?: ShareState;
  wa?: WhatsAppStatus;
  waReady: boolean;
  waEntitled: boolean;
  ownerMobile: string;
}) {
  const { t } = useTranslation();

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
      <Group h="100%" gap={0} align="stretch" wrap="nowrap" className="share-post-shell">
        {/* ---- Form ---- */}
        <Box className="share-post-composer">
          <Group
            gap="sm"
            px={20}
            py="md"
            wrap="nowrap"
            style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={onClose}
              aria-label={t("common.cancel")}
            >
              <X size={18} />
            </ActionIcon>
            <Divider orientation="vertical" my={6} />
            <Text fw={600}>
              {editingId ? t("reports.dialogEditTitle") : t("reports.dialogNewTitle")}
            </Text>
          </Group>

          <ReportSteps tab={tab} tabIndex={tabIndex} setTab={setTab} />

          <Box style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <Box className="share-post-body">
              {tab === "schedule" && (
                <ScheduleStep draft={draft} setDraft={setDraft} sites={sites} />
              )}
              {tab === "delivery" && (
                <DeliveryStep
                  draft={draft}
                  setDraft={setDraft}
                  emailInput={emailInput}
                  setEmailInput={setEmailInput}
                  addEmail={addEmail}
                  removeEmail={removeEmail}
                  wa={wa}
                  waReady={waReady}
                  waEntitled={waEntitled}
                  ownerMobile={ownerMobile}
                />
              )}
              {tab === "content" && (
                <ContentStep draft={draft} setDraft={setDraft} share={share} />
              )}
            </Box>
          </Box>

          {/* Action bar, pinned so Save stays reachable however long the form.
              Next rather than Save on the first two steps, so a new report walks
              through all three — a Save offered on step one invites submitting a
              half-filled form. Editing skips the walkthrough: the reason for
              opening is usually one known field, so Save is available from
              wherever that field is. */}
          <Group
            justify="space-between"
            px={20}
            py="md"
            wrap="nowrap"
            style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
          >
            {tabIndex > 0 ? (
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setTab(TAB_ORDER[tabIndex - 1])}
                leftSection={<ChevronLeft size={15} />}
              >
                {t("common.back")}
              </Button>
            ) : (
              <Button variant="subtle" color="gray" onClick={onClose}>
                {t("common.cancel")}
              </Button>
            )}

            {isLastTab || editingId ? (
              <Button loading={saving} onClick={submit}>
                {editingId ? t("common.save") : t("reports.scheduleReport")}
              </Button>
            ) : (
              <Button
                onClick={() => setTab(TAB_ORDER[tabIndex + 1])}
                rightSection={<ChevronRight size={15} />}
              >
                {t("common.next")}
              </Button>
            )}
          </Group>
        </Box>

        {/* ---- Preview ---- */}
        <Box className="share-post-preview">
          <Group justify="space-between" align="center" mb="xl" wrap="nowrap">
            <Text fw={700} size="lg">{t("reports.previewTitle")}</Text>
            <Tooltip label={t("reports.previewHint")} withArrow multiline w={240}>
              <Badge variant="light" color="gray">{t("reports.previewBadge")}</Badge>
            </Tooltip>
          </Group>

          <Box style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
            <Box w="100%">
              <ReportPreview
                draft={draft}
                sites={sites}
                shareEnabled={Boolean(share?.enabled)}
              />
            </Box>
          </Box>
        </Box>
      </Group>
    </Modal>
  );
}
