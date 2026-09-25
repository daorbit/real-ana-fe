import type { ReactNode, Ref } from "react";
import { ActionIcon, Alert, Button, MultiSelect, Switch, Text, TextInput } from "@mantine/core";
import {
  BarChart3, FileSpreadsheet, Link2, Mail, MessageCircle, MessageSquareText, Search, X,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { REPORT_FREQUENCIES } from "@/shared/types";
import type { ShareState, Site, WhatsAppStatus } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyHint, frequencyLabel } from "@/features/reports/pages/utils";
import classes from "./Reports.module.css";

export type FormSection = "schedule" | "delivery" | "content";

interface Props {
  draft: Draft;
  setDraft: (d: Draft) => void;
  sites: Site[];
  emailInput: string;
  setEmailInput: (v: string) => void;
  addEmail: () => void;
  removeEmail: (email: string) => void;
  ownerEmail: string;
  ownerMobile: string;
  wa?: WhatsAppStatus;
  waReady: boolean;
  waEntitled: boolean;
  share?: ShareState;
  sectionRef: (id: FormSection) => Ref<HTMLElement>;
}

function Section({
  id, num, title, description, children, sectionRef,
}: {
  id: FormSection;
  num: number;
  title: string;
  description: string;
  children: ReactNode;
  sectionRef: (id: FormSection) => Ref<HTMLElement>;
}) {
  return (
    <section ref={sectionRef(id)} className={classes.section} aria-labelledby={`report-${id}`}>
      <div className={classes.sectionHead}>
        <span className={classes.sectionNum}>{num}</span>
        <div>
          <h3 id={`report-${id}`} className={classes.sectionTitle}>{title}</h3>
          <p className={classes.sectionDesc}>{description}</p>
        </div>
      </div>
      <div className={classes.sectionBody}>{children}</div>
    </section>
  );
}

function ToggleRow({
  icon: Icon, label, hint, checked, disabled, onChange,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className={classes.toggleRow} data-disabled={disabled || undefined}>
      <span className={classes.toggleIcon}>
        <Icon size={15} />
      </span>
      <span className={classes.toggleText}>
        <span className={classes.toggleLabel}>{label}</span>
        <span className={classes.toggleHint}>{hint}</span>
      </span>
      <Switch
        size="sm"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.currentTarget.checked)}
        aria-label={label}
      />
    </label>
  );
}

/**
 * The whole report on one page, in three numbered sections: when it goes out,
 * who gets it, and what's in it. One page rather than a wizard, so nothing is
 * hidden behind a Next button and editing one field is a single scroll.
 */
export function ReportForm({
  draft, setDraft, sites, emailInput, setEmailInput, addEmail, removeEmail,
  ownerEmail, ownerMobile, wa, waReady, waEntitled, share, sectionRef,
}: Props) {
  const { t } = useTranslation();

  // The plan check comes first: to someone on Free, "temporarily unavailable"
  // would promise a channel that upgrading is the only way to get.
  const waHint = !waEntitled
    ? t("reports.waNotEntitled")
    : !wa?.configured
      ? t("reports.waNotConfigured")
      : wa.status === "connected"
        ? t("reports.waConnected")
        : t("reports.waUnavailable");

  return (
    <div className={classes.form}>
      <Section
        id="schedule"
        num={1}
        title={t("reports.sectionBasics")}
        description={t("reports.sectionBasicsDesc")}
        sectionRef={sectionRef}
      >
        <TextInput
          label={t("reports.nameLabel")}
          placeholder={t("reports.namePlaceholder")}
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })}
          data-autofocus
        />

        <div>
          <span className={classes.fieldLabel}>{t("reports.howOften")}</span>
          <div className={classes.options} role="radiogroup" aria-label={t("reports.howOften")}>
            {REPORT_FREQUENCIES.map((f) => {
              const checked = draft.frequency === f;
              return (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  data-checked={checked || undefined}
                  className={classes.option}
                  onClick={() => setDraft({ ...draft, frequency: f })}
                >
                  <span className={classes.optionLabel}>{frequencyLabel(f)}</span>
                  <span className={classes.optionHint}>{frequencyHint(f)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <MultiSelect
          label={t("reports.sitesLabel")}
          description={t("reports.sitesDesc")}
          placeholder={draft.siteIds.length ? undefined : t("reports.allSitesPlaceholder")}
          data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
          value={draft.siteIds}
          onChange={(v) => setDraft({ ...draft, siteIds: v })}
          searchable
          clearable
          comboboxProps={{ withinPortal: true }}
        />

        <Switch
          label={t("reports.activeLabel")}
          description={t("reports.activeDesc")}
          checked={draft.enabled}
          onChange={(e) => setDraft({ ...draft, enabled: e.currentTarget.checked })}
        />
      </Section>

      <Section
        id="delivery"
        num={2}
        title={t("reports.sectionRecipients")}
        description={t("reports.alsoSendToDesc")}
        sectionRef={sectionRef}
      >
        <div className={classes.rows}>
          <div className={classes.recipientList}>
            <div className={classes.recipient}>
              <Mail size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
              <span className={classes.recipientEmail}>{ownerEmail || t("reports.previewFlowYou")}</span>
              <span className={classes.recipientTag}>{t("reports.youAlways")}</span>
            </div>
            {draft.recipients.map((email) => (
              <div key={email} className={classes.recipient}>
                <Mail size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                <span className={classes.recipientEmail}>{email}</span>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={() => removeEmail(email)}
                  aria-label={t("reports.removeRecipient", { email })}
                >
                  <X size={14} />
                </ActionIcon>
              </div>
            ))}
          </div>
          <div className={classes.addRow}>
            <TextInput
              style={{ flex: 1 }}
              size="sm"
              placeholder={t("reports.emailPlaceholder")}
              aria-label={t("reports.alsoSendTo")}
              value={emailInput}
              onChange={(e) => setEmailInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addEmail();
                }
              }}
            />
            <Button size="sm" variant="default" onClick={addEmail} disabled={!emailInput.trim()}>
              {t("reports.add")}
            </Button>
          </div>
        </div>

        <div>
          <span className={classes.fieldLabel}>{t("reports.deliverBy")}</span>
          <div className={classes.rows}>
            <ToggleRow
              icon={Mail}
              label={t("reports.channelEmail")}
              hint={t("reports.channelEmailHint")}
              checked={draft.emailChannel}
              onChange={(v) => setDraft({ ...draft, emailChannel: v })}
            />
            <ToggleRow
              icon={MessageCircle}
              label={t("reports.channelWhatsApp")}
              hint={waHint}
              checked={draft.whatsappChannel}
              disabled={!waReady || !waEntitled}
              onChange={(v) => setDraft({ ...draft, whatsappChannel: v })}
            />
          </div>
          {draft.whatsappChannel && (
            <Alert color="teal" variant="light" radius="md" p="xs" mt="xs" icon={<MessageCircle size={15} />}>
              <Text size="xs">
                {ownerMobile
                  ? t("reports.waNoticeWithNumber", { phone: ownerMobile })
                  : t("reports.waNoticeNoNumber")}
              </Text>
            </Alert>
          )}
        </div>
      </Section>

      <Section
        id="content"
        num={3}
        title={t("reports.sectionContents")}
        description={t("reports.sectionContentsDesc")}
        sectionRef={sectionRef}
      >
        <div>
          <div className={classes.rows}>
            <ToggleRow
              icon={BarChart3}
              label={t("reports.includeAnalyticsLabel")}
              hint={t("reports.includeAnalyticsDesc")}
              checked={draft.analytics}
              onChange={(v) => setDraft({ ...draft, analytics: v })}
            />
            {/* Disabled rather than hidden without analytics: it is written from
                those figures, and a control that vanishes reads as a bug. */}
            <ToggleRow
              icon={MessageSquareText}
              label={t("reports.includeAiLabel")}
              hint={draft.analytics ? t("reports.includeAiDesc") : t("reports.includeAiNeedsAnalytics")}
              checked={draft.aiSummary && draft.analytics}
              disabled={!draft.analytics}
              onChange={(v) => setDraft({ ...draft, aiSummary: v })}
            />
            <ToggleRow
              icon={Search}
              label={t("reports.includeSeoLabel")}
              hint={t("reports.includeSeoDesc")}
              checked={draft.seo}
              onChange={(v) => setDraft({ ...draft, seo: v })}
            />
            <ToggleRow
              icon={FileSpreadsheet}
              label={t("reports.includeXlsxLabel")}
              hint={t("reports.includeXlsxDesc")}
              checked={draft.attachXlsx}
              onChange={(v) => setDraft({ ...draft, attachXlsx: v })}
            />
            <ToggleRow
              icon={Link2}
              label={t("reports.includeLinkLabel")}
              hint={share?.enabled ? t("reports.includeLinkOnDesc") : t("reports.includeLinkOffDesc")}
              checked={draft.dashboardLink}
              onChange={(v) => setDraft({ ...draft, dashboardLink: v })}
            />
          </div>
          {draft.dashboardLink && !share?.enabled && (
            <Alert color="yellow" variant="light" mt="xs" radius="md" p="xs">
              <Text size="xs">{t("reports.dashboardOffWarning")}</Text>
            </Alert>
          )}
        </div>
      </Section>
    </div>
  );
}
