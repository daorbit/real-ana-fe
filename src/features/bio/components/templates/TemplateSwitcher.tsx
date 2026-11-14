import { useMemo } from "react";
import { Modal } from "@mantine/core";
import { BIO_TEMPLATES, templateForTheme, templateOnContent } from "@/features/bio/templates/bioTemplates";
import type { BioTemplate } from "@/features/bio/templates/templateTypes";
import type { BioPageInput } from "@/features/bio/types";
import { TemplateGallery } from "./TemplateGallery";
import classes from "./TemplateSwitcher.module.css";

function SwitcherGallery({ draft, onPick }: { draft: BioPageInput; onPick: (template: BioTemplate) => void }) {
  const previews = useMemo(
    () => new Map(BIO_TEMPLATES.filter((t) => t.kind === draft.kind).map((t) => [t.id, templateOnContent(t, draft)])),
    [draft],
  );
  const activeId = templateForTheme(draft.theme)?.id ?? null;

  return <TemplateGallery kind={draft.kind} activeId={activeId} previews={previews} onPick={onPick} />;
}

export function TemplateSwitcher({
  opened,
  draft,
  onClose,
  onPick,
}: {
  opened: boolean;
  draft: BioPageInput;
  onClose: () => void;
  onPick: (template: BioTemplate) => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Change template"
      size={1080}
      radius="lg"
      centered
      classNames={{ title: classes.title, body: classes.body }}
    >
      <p className={classes.note}>Your text, links and images stay. Only the design changes, and nothing is saved until you save.</p>
      <SwitcherGallery
        draft={draft}
        onPick={(template) => {
          onPick(template);
          onClose();
        }}
      />
    </Modal>
  );
}
