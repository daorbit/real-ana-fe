import { useState } from "react";
import type { FormEvent } from "react";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Check, Mail, UserPlus } from "lucide-react";
import type { WorkspaceRole } from "@/shared/types";
import { ROLE_META, roleLabel } from "./roles";
import classes from "./Members.module.css";

export function InviteModal({
  opened,
  workspaceName,
  roles,
  sending,
  onClose,
  onSend,
}: {
  opened: boolean;
  workspaceName: string;
  roles: WorkspaceRole[];
  sending: boolean;
  onClose: () => void;
  onSend: (email: string, role: WorkspaceRole) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("viewer");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await onSend(email.trim(), role)) {
      setEmail("");
      setRole("viewer");
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<span className={classes.modalTitle}>Invite to {workspaceName}</span>}
      radius="lg"
      size={480}
      centered
    >
      <form onSubmit={submit}>
        <Stack gap="lg">
          <TextInput
            label="Email address"
            placeholder="teammate@company.com"
            type="email"
            size="md"
            radius="md"
            required
            leftSection={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            description="They'll get a link. If they don't have an account yet, they can create one from it."
          />

          <div>
            <p className={classes.fieldLabel}>Role</p>
            <div className={classes.roleOptions} role="radiogroup" aria-label="Role">
              {roles.map((r) => {
                const Icon = ROLE_META[r].icon;
                const active = r === role;
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`${classes.tone} ${classes.roleOption}`}
                    data-role={r}
                    data-active={active || undefined}
                    onClick={() => setRole(r)}
                  >
                    <span className={classes.roleIcon}>
                      <Icon size={15} />
                    </span>
                    <span className={classes.roleOptionText}>
                      <span className={classes.optionName}>{roleLabel(r)}</span>
                      <span className={classes.optionBlurb}>{ROLE_META[r].blurb}</span>
                    </span>
                    <span className={classes.radio} aria-hidden>
                      {active && <Check size={11} strokeWidth={3.5} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={classes.modalActions}>
            <Button variant="subtle" color="gray" radius="md" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" radius="md" loading={sending} leftSection={<UserPlus size={15} />}>
              Send invitation
            </Button>
          </div>
        </Stack>
      </form>
    </Modal>
  );
}
