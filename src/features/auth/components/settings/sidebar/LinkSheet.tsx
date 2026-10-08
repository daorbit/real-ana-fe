import { useState } from "react";
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { Trash2 } from "lucide-react";
import {
  LINK_ROUTE,
  newLinkId,
  slugify,
  withLink,
  withoutLink,
  type CustomLink,
  type CustomLinkMode,
} from "@/app/shell/navPrefs";
import { notify, errMessage } from "@/shared/lib/notify";
import { linkHost, normaliseLinkUrl } from "@/features/customLinks/lib/linkUrl";
import { LogoPicker } from "./LogoPicker";
import { OpenModeChoice } from "./OpenModeChoice";
import type { NavPrefsEditor } from "./useNavPrefsEditor";
import classes from "./Sidebar.module.css";

export function LinkSheet({
  opened,
  link,
  editor,
  onClose,
}: {
  opened: boolean;
  link: CustomLink | null;
  editor: NavPrefsEditor;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(link?.label ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [mode, setMode] = useState<CustomLinkMode>(link?.mode ?? "internal");
  const [slug, setSlug] = useState(link?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(link?.slug));
  const [urlError, setUrlError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const cleanUrl = normaliseLinkUrl(url);
  const previewLogo = logo === undefined ? link?.logoUrl ?? "" : logo ?? "";
  const fallbackName = cleanUrl ? linkHost(cleanUrl) : "";
  const autoSlug = slugify(label || fallbackName.split(".")[0] || "");
  const effectiveSlug = slugTouched ? slugify(slug) : autoSlug;

  const save = async () => {
    if (!cleanUrl) {
      setUrlError("Enter a valid web address, like stripe.com");
      return;
    }
    if (mode === "internal") {
      if (!effectiveSlug) {
        setSlugError("Use letters, numbers and dashes");
        return;
      }
      const taken = editor.prefs.links.some((l) => l.id !== link?.id && l.mode === "internal" && l.slug === effectiveSlug);
      if (taken) {
        setSlugError("Another link already uses this address");
        return;
      }
    }
    const id = link?.id ?? newLinkId();
    const name = (label.trim() || fallbackName).slice(0, 40);
    setSaving(true);
    try {
      editor.apply(
        withLink(editor.prefs, {
          id,
          label: name,
          url: cleanUrl,
          mode,
          slug: mode === "internal" ? effectiveSlug : "",
          logoUrl: link?.logoUrl ?? "",
        }),
      );
      if (logo !== undefined) await editor.setLogo(id, logo);
      else await editor.flush();
      onClose();
    } catch (e) {
      notify.error(errMessage(e, "Couldn't save the link."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!link) return;
    editor.apply(withoutLink(editor.prefs, link.id));
    await editor.flush();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={link ? "Edit link" : "New link"} size={500}>
      <Stack gap="lg">
        <LogoPicker
          url={cleanUrl ?? "https://example.com"}
          label={label || fallbackName}
          logoUrl={previewLogo}
          custom={Boolean(previewLogo)}
          onPick={setLogo}
          onReset={() => setLogo(null)}
        />

        <TextInput
          label="Website"
          placeholder="stripe.com"
          value={url}
          error={urlError}
          data-autofocus
          onChange={(e) => {
            setUrl(e.currentTarget.value);
            setUrlError(null);
          }}
        />

        <TextInput
          label="Name"
          placeholder={fallbackName || "Stripe dashboard"}
          value={label}
          maxLength={40}
          onChange={(e) => setLabel(e.currentTarget.value)}
        />

        <OpenModeChoice value={mode} onChange={setMode} />

        {mode === "internal" && (
          <TextInput
            label="Page address"
            description="Where this link lives inside Quantalog"
            placeholder="stripe"
            value={slugTouched ? slug : autoSlug}
            error={slugError}
            maxLength={40}
            leftSection={<span className={classes.slugPrefix}>{LINK_ROUTE}/</span>}
            leftSectionWidth={84}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.currentTarget.value.toLowerCase());
              setSlugError(null);
            }}
          />
        )}

        <Group justify="space-between" mt="xs" className={classes.sheetFoot}>
          {link ? (
            <Button variant="subtle" color="red" leftSection={<Trash2 size={15} />} onClick={() => void remove()} disabled={saving}>
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Group gap="sm">
            <Button variant="default" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void save()} loading={saving} disabled={!url.trim()}>
              {link ? "Save" : "Add link"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
