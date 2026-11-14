import { useState } from "react";
import { SortableList } from "@/shared/ui/SortableList";
import { BIO_MAX_LINKS } from "@/features/bio/lib/bioOptions";
import { detectService, looksLikeUrl } from "@/features/bio/lib/serviceCatalog";
import type { BioStudioState } from "@/features/bio/hooks/useBioStudio";
import { hostOf } from "../views/layoutTypes";
import { LinkRowEditor } from "./LinkRowEditor";
import { AddButton } from "./ui/AddButton";
import { Card, CardSection } from "./ui/Card";
import { PopoverPanel } from "./ui/PopoverPanel";
import { QuickInput } from "./ui/QuickInput";
import classes from "./ui/List.module.css";

function withScheme(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function LinksEditor({ studio }: { studio: BioStudioState }) {
  const { links } = studio.draft;
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const quickAdd = (text: string) => {
    const isUrl = looksLikeUrl(text) && !/\s/.test(text);
    const url = isUrl ? withScheme(text) : "";
    const id = studio.addLink(isUrl ? { label: detectService(url)?.name ?? hostOf(url), url } : { label: text });
    if (!isUrl) setOpenId(id);
    setAdding(false);
  };

  return (
    <CardSection
      title="Links"
      meta={
        <PopoverPanel
          opened={adding}
          onChange={setAdding}
          target={<AddButton disabled={links.length >= BIO_MAX_LINKS} onClick={() => setAdding((o) => !o)} />}
        >
          <div className={classes.addPanel}>
            <QuickInput placeholder="Paste a URL or type a title" onSubmit={quickAdd} />
            <p className={classes.panelHint}>Press Return. A pasted URL gets its title automatically.</p>
          </div>
        </PopoverPanel>
      }
    >
      <Card padded={false}>
        {links.length === 0 ? (
          <p className={classes.empty}>No links yet. Use Add to create your first one.</p>
        ) : (
          <SortableList
            items={links}
            itemClassName={classes.sortRow}
            onReorder={studio.reorderLinks}
            renderItem={(link, handle) => (
              <LinkRowEditor
                link={link}
                open={openId === link.id}
                handle={handle}
                onToggleOpen={() => setOpenId((id) => (id === link.id ? null : link.id))}
                onChange={(patch) => studio.updateLink(link.id, patch)}
                onRemove={() => studio.removeLink(link.id)}
              />
            )}
          />
        )}
      </Card>
    </CardSection>
  );
}
