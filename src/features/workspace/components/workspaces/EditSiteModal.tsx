import type { FormEvent } from "react";
import { Button, Modal, Stack, TextInput } from "@mantine/core";
import { Globe, Info, Type } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEditSite } from "@/features/workspace/hooks/useEditSite";
import type { Site } from "@/shared/types";
import classes from "./Workspaces.module.css";

interface Props {
  site: Site | null;
  sites: Site[];
  workspaceId: string;
  onClose: () => void;
}

export function EditSiteModal({ site, sites, workspaceId, onClose }: Props) {
  const { t } = useTranslation();
  const form = useEditSite(workspaceId, site, sites);
  const isApp = site?.platform === "app";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await form.save()) onClose();
  };

  return (
    <Modal
      opened={Boolean(site)}
      onClose={onClose}
      title={<span className={classes.modalTitle}>{t("workspaces.editSiteTitle", "Edit site")}</span>}
      radius="lg"
      size={480}
      centered
    >
      <form onSubmit={submit}>
        <Stack gap="lg">
          <TextInput
            label={t("workspaces.siteNameLabel", "Site name")}
            size="md"
            radius="md"
            leftSection={<Type size={16} />}
            value={form.name}
            onChange={(e) => form.setName(e.currentTarget.value)}
            error={form.nameError}
            data-autofocus
          />
          <TextInput
            label={t("workspaces.siteDomainLabel", "Domain")}
            placeholder="example.com"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            size="md"
            radius="md"
            leftSection={<Globe size={16} />}
            value={form.domain}
            onChange={(e) => form.setDomain(e.currentTarget.value)}
            error={form.domainError}
            description={
              isApp
                ? t("workspaces.siteDomainAppHint", "Optional for apps.")
                : t("workspaces.siteDomainHint", "Your history, goals and snippet stay the same — only the domain changes.")
            }
          />

          {form.domainChanged && !form.domainError && (
            <div className={classes.editNote}>
              <Info size={14} />
              <span>
                {t(
                  "workspaces.siteDomainNote",
                  "Keep the same snippet on the new domain. If Search Console is linked, re-link it to the new property.",
                )}
              </span>
            </div>
          )}

          <div className={classes.modalActions}>
            <Button variant="subtle" color="gray" radius="md" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" radius="md" loading={form.saving}>
              {t("workspaces.saveSite", "Save changes")}
            </Button>
          </div>
        </Stack>
      </form>
    </Modal>
  );
}
