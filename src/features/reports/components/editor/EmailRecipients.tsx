import { ActionIcon, Button, TextInput } from "@mantine/core";
import { Mail, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import reportClasses from "../Reports.module.css";
import classes from "./Editor.module.css";

interface Props {
  ownerEmail: string;
  recipients: string[];
  emailInput: string;
  setEmailInput: (v: string) => void;
  addEmail: () => void;
  removeEmail: (email: string) => void;
}

export function EmailRecipients({ ownerEmail, recipients, emailInput, setEmailInput, addEmail, removeEmail }: Props) {
  const { t } = useTranslation();

  return (
    <div className={reportClasses.rows}>
      <div className={reportClasses.recipientList}>
        <div className={reportClasses.recipient}>
          <Mail size={14} className={classes.recipientIcon} />
          <span className={reportClasses.recipientEmail}>{ownerEmail || t("reports.previewFlowYou")}</span>
          <span className={reportClasses.recipientTag}>{t("reports.youAlways")}</span>
        </div>
        {recipients.map((email) => (
          <div key={email} className={reportClasses.recipient}>
            <Mail size={14} className={classes.recipientIcon} />
            <span className={reportClasses.recipientEmail}>{email}</span>
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
      <div className={reportClasses.addRow}>
        <TextInput
          className={classes.grow}
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
  );
}
