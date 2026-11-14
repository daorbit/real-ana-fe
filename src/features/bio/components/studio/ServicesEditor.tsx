import { useState } from "react";
import { Plus } from "lucide-react";
import { SortableList } from "@/shared/ui/SortableList";
import { BIO_MAX_ROWS } from "@/features/bio/lib/bioOptions";
import { newServiceRow } from "@/features/bio/lib/serviceRows";
import { useServicePaste } from "@/features/bio/hooks/useServicePaste";
import type { BioStudioState } from "@/features/bio/hooks/useBioStudio";
import { ServiceTile } from "./ServiceTile";
import { CardSection } from "./ui/Card";
import { PopoverPanel } from "./ui/PopoverPanel";
import { QuickInput } from "./ui/QuickInput";
import { ServicePickerList } from "./ui/ServicePickerList";
import list from "./ui/List.module.css";
import classes from "./ui/Tiles.module.css";

export function ServicesEditor({ workspaceId, studio }: { workspaceId: string | undefined; studio: BioStudioState }) {
  const rows = studio.draft.release?.rows ?? [];
  const paste = useServicePaste(workspaceId, studio);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const missing = rows.filter((row) => !row.url.trim()).length;
  const full = rows.length >= BIO_MAX_ROWS;

  const pick = (serviceId: string) => {
    const row = newServiceRow(serviceId);
    studio.addRows([row]);
    setAdding(false);
    setOpenId(row.id);
  };

  return (
    <CardSection title="Services" meta={missing ? `${missing} need a link` : `${rows.length} services`}>
      <div className={classes.grid}>
        <SortableList
          items={rows}
          layout="grid"
          itemClassName={classes.sortTile}
          onReorder={studio.reorderRows}
          renderItem={(row, handle) => (
            <ServiceTile
              row={row}
              open={openId === row.id}
              handle={handle}
              onOpenChange={(open) => setOpenId(open ? row.id : null)}
              onChange={(patch) => studio.updateRow(row.id, patch)}
              onRemove={() => studio.removeRow(row.id)}
            />
          )}
        />
        {!full && (
          <PopoverPanel
            opened={adding}
            onChange={setAdding}
            width={320}
            position="bottom"
            target={
              <button type="button" className={classes.addTile} onClick={() => setAdding((o) => !o)}>
                <span className={classes.addCircle}>
                  <Plus size={18} />
                </span>
                Add
              </button>
            }
          >
            <div className={list.addPanel}>
              <QuickInput
                placeholder="Paste a Spotify, YouTube or store link"
                busy={paste.resolving}
                submitOnPaste
                onSubmit={async (text) => {
                  await paste.submit(text);
                  setAdding(false);
                }}
              />
              <span className={list.divider}>or choose</span>
              <ServicePickerList exclude={rows.map((r) => r.service)} onPick={pick} />
            </div>
          </PopoverPanel>
        )}
      </div>
    </CardSection>
  );
}
