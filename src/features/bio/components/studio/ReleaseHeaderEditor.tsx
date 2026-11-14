import { Disc3 } from "lucide-react";
import type { BioPageInput, BioRelease } from "@/features/bio/types";
import { ImageTile } from "./ImageTile";
import { ShortLinkField } from "./ShortLinkField";
import { Card } from "./ui/Card";
import { DateChip } from "./ui/DateChip";
import { InlineField } from "./ui/InlineField";
import classes from "./Editor.module.css";

export function ReleaseHeaderEditor({
  draft,
  onChange,
  onReleaseChange,
}: {
  draft: BioPageInput;
  onChange: (patch: Partial<BioPageInput>) => void;
  onReleaseChange: (patch: Partial<BioRelease>) => void;
}) {
  const release = draft.release;

  return (
    <Card padded={false}>
      <div className={classes.profile}>
        <ImageTile
          url={release?.artworkUrl ?? ""}
          shape="square"
          placeholder={<Disc3 size={24} strokeWidth={1.3} />}
          pickerTitle="Choose the artwork"
          onChange={(artworkUrl) => onReleaseChange({ artworkUrl })}
        />
        <div className={classes.profileText}>
          <InlineField tone="title" label="Title" placeholder="Artist – Release name" maxLength={100} value={draft.title} onChange={(title) => onChange({ title })} />
          <InlineField
            tone="sub"
            label="Line under the title"
            placeholder="Choose music service"
            maxLength={80}
            value={release?.subtitle ?? ""}
            onChange={(subtitle) => onReleaseChange({ subtitle })}
          />
          <DateChip value={release?.releaseDate ?? ""} onChange={(releaseDate) => onReleaseChange({ releaseDate })} />
        </div>
      </div>
      <ShortLinkField slug={draft.slug} title={draft.title} onChange={(slug) => onChange({ slug })} />
    </Card>
  );
}
