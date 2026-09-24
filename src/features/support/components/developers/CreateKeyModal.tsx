import { useState } from "react";
import {
  ActionIcon, Alert, Box, Button, CopyButton, Group, Modal, Select, Stack, Text, TextInput, Tooltip,
} from "@mantine/core";
import { AlertTriangle, Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { shortDate } from "@/shared/lib/format";
import type { ApiKey } from "@/shared/types";
import { EXPIRY_OPTIONS, expiryDate, expiryDays, type ExpiryOption } from "../../developers";
import classes from "./Developers.module.css";

interface Props {
  opened: boolean;
  onClose: () => void;
  workspaceName: string;
  creating: boolean;
  onCreate: (name: string, expiresInDays: number | null) => Promise<ApiKey | null>;
}

export function CreateKeyModal({ opened, onClose, workspaceName, creating, onCreate }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState<ExpiryOption>("never");
  const [created, setCreated] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [warned, setWarned] = useState(false);

  const expiryData = EXPIRY_OPTIONS.map((value) => ({
    value,
    label: value === "never" ? t("developers.expiryNever") : t("developers.expiryDays", { count: Number(value) }),
  }));
  const expiresOn = expiryDate(expiry);

  const reset = () => {
    setName("");
    setExpiry("never");
    setCreated(null);
    setCopied(false);
    setWarned(false);
  };

  const close = () => {
    if (created && !copied && !warned) {
      setWarned(true);
      return;
    }
    onClose();
    reset();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = await onCreate(name, expiryDays(expiry));
    if (key) setCreated(key);
  };

  const revealed = Boolean(created?.key);

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={revealed ? t("developers.saveKeyTitle") : t("developers.createTitle")}
      centered
      radius="lg"
      size={revealed ? "lg" : "md"}
      closeOnClickOutside={!revealed}
      closeOnEscape={!revealed}
    >
      {revealed && created?.key ? (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t("developers.saveKeyBody")}
          </Text>

          <Group gap="xs" wrap="nowrap">
            <TextInput
              readOnly
              value={created.key}
              className={classes.secretInput}
              flex={1}
              onFocus={(e) => e.currentTarget.select()}
              aria-label={created.name}
            />
            <CopyButton value={created.key}>
              {({ copied: justCopied, copy }) => (
                <Tooltip label={justCopied ? t("developers.copied") : t("developers.copyKey")} withArrow>
                  <ActionIcon
                    size={36}
                    variant={justCopied ? "filled" : "default"}
                    color={justCopied ? "teal" : undefined}
                    onClick={() => {
                      copy();
                      setCopied(true);
                    }}
                    aria-label={t("developers.copyKey")}
                  >
                    {justCopied ? <Check size={16} /> : <Copy size={16} />}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>

          <Text size="xs" c="dimmed">
            {created.expiresAt
              ? t("developers.expiresOn", { date: shortDate(created.expiresAt) })
              : t("developers.expiresNeverHint")}
          </Text>

          {warned && !copied && (
            <Alert color="yellow" variant="light" icon={<AlertTriangle size={16} />}>
              <Text size="sm">{t("developers.notCopiedWarning")}</Text>
            </Alert>
          )}

          <Group justify="flex-end">
            <Button onClick={close} variant={warned && !copied ? "default" : "filled"}>
              {warned && !copied ? t("developers.closeAnyway") : t("developers.done")}
            </Button>
          </Group>
        </Stack>
      ) : (
        <form onSubmit={submit}>
          <Stack gap="md">
            <TextInput
              label={t("developers.keyName")}
              description={t("developers.keyNameDesc")}
              placeholder={t("developers.keyNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              maxLength={80}
              data-autofocus
            />

            <Select
              label={t("developers.expiration")}
              description={
                expiresOn
                  ? t("developers.expiresOn", { date: shortDate(expiresOn) })
                  : t("developers.expiresNeverHint")
              }
              data={expiryData}
              value={expiry}
              onChange={(v) => v && setExpiry(v as ExpiryOption)}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />

            <Box>
              <Text size="sm" fw={500} mb={6}>
                {t("developers.permissions")}
              </Text>
              <Box className={classes.scopeList}>
                <span className={classes.scopeLabel}>{t("developers.scopeWorkspace")}</span>
                <span>{workspaceName}</span>
                <span className={classes.scopeLabel}>{t("developers.scopeAccess")}</span>
                <span>{t("developers.scopeAccessValue")}</span>
              </Box>
            </Box>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={close}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={creating}>
                {t("developers.createSecretKey")}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
