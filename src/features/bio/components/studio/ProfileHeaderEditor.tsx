import { UserRound } from "lucide-react";
import type { BioPageInput } from "@/features/bio/types";
import { ImageTile } from "./ImageTile";
import { ShortLinkField } from "./ShortLinkField";
import { Card } from "./ui/Card";
import { InlineField } from "./ui/InlineField";
import classes from "./Editor.module.css";

export function ProfileHeaderEditor({ draft, onChange }: { draft: BioPageInput; onChange: (patch: Partial<BioPageInput>) => void }) {
  return (
    <Card padded={false}>
      <div className={classes.profile}>
        <ImageTile
          url={draft.avatarUrl}
          shape="circle"
          placeholder={<UserRound size={28} strokeWidth={1.5} />}
          pickerTitle="Choose a profile photo"
          onChange={(avatarUrl) => onChange({ avatarUrl })}
        />
        <div className={classes.profileText}>
          <InlineField tone="title" label="Name" placeholder="Add your name" maxLength={80} value={draft.title} onChange={(title) => onChange({ title })} />
          <InlineField tone="body" label="Bio" placeholder="Add a short bio" maxLength={280} value={draft.bio} onChange={(bio) => onChange({ bio })} />
        </div>
      </div>
      <ShortLinkField slug={draft.slug} title={draft.title} onChange={(slug) => onChange({ slug })} />
    </Card>
  );
}
