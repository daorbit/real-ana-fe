import { useState } from "react";
import { Button, Group, Textarea, TextInput } from "@mantine/core";
import { ImageIcon, UserRound } from "lucide-react";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import { publicBioDisplay, slugify } from "@/features/bio/lib/bioOptions";
import type { BioPageInput } from "@/features/bio/types";
import { StudioCard } from "./StudioCard";
import classes from "./BioStudio.module.css";

const BIO_LIMIT = 280;

export function ProfileSection({
  draft,
  isNew,
  onChange,
}: {
  draft: BioPageInput;
  isNew: boolean;
  onChange: (patch: Partial<BioPageInput>) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  return (
    <StudioCard title="Profile" description="Who the page is for. This is the first thing visitors see.">
      <div className={classes.avatarRow}>
        <span className={classes.avatar} aria-hidden>
          {draft.avatarUrl ? <img src={draft.avatarUrl} alt="" className={classes.avatarImage} /> : <UserRound size={26} />}
        </span>
        <Group gap="xs">
          <Button variant="default" size="xs" leftSection={<ImageIcon size={14} />} onClick={() => setPicking(true)}>
            {draft.avatarUrl ? "Change photo" : "Add photo"}
          </Button>
          {draft.avatarUrl && (
            <Button variant="subtle" color="gray" size="xs" onClick={() => onChange({ avatarUrl: "" })}>
              Remove
            </Button>
          )}
        </Group>
      </div>

      <TextInput
        label="Title"
        placeholder="Your name or brand"
        maxLength={80}
        value={draft.title}
        onChange={(e) => {
          const title = e.currentTarget.value;
          onChange(slugTouched ? { title } : { title, slug: slugify(title) });
        }}
      />

      <Textarea
        label="Bio"
        placeholder="A line or two about what you do"
        autosize
        minRows={2}
        maxRows={5}
        maxLength={BIO_LIMIT}
        description={`${draft.bio.length} / ${BIO_LIMIT}`}
        inputWrapperOrder={["label", "input", "description"]}
        value={draft.bio}
        onChange={(e) => onChange({ bio: e.currentTarget.value })}
      />

      <TextInput
        label="Page address"
        description={publicBioDisplay(draft.slug || "your-page")}
        inputWrapperOrder={["label", "input", "description"]}
        placeholder="your-name"
        maxLength={32}
        value={draft.slug}
        onChange={(e) => {
          setSlugTouched(true);
          onChange({ slug: e.currentTarget.value.toLowerCase().replace(/[^a-z0-9-]/g, "") });
        }}
      />

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        kind="image"
        title="Choose a profile photo"
        onPick={(asset) => {
          onChange({ avatarUrl: asset.url });
          setPicking(false);
        }}
      />
    </StudioCard>
  );
}
