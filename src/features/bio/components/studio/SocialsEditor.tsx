import { useState } from "react";
import { SortableList } from "@/shared/ui/SortableList";
import { BIO_SOCIAL_NETWORKS, newRowId } from "@/features/bio/lib/bioOptions";
import { patchById, removeById, reorder } from "@/features/bio/lib/listOps";
import type { BioSocial, BioSocialNetwork } from "@/features/bio/types";
import { SocialLogo } from "../SocialLogo";
import { SocialRowEditor } from "./SocialRowEditor";
import { AddButton } from "./ui/AddButton";
import { Card, CardSection } from "./ui/Card";
import { PopoverPanel } from "./ui/PopoverPanel";
import classes from "./ui/List.module.css";

const MAX_SOCIALS = 24;

export function SocialsEditor({ socials, onChange }: { socials: BioSocial[]; onChange: (socials: BioSocial[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const add = (network: BioSocialNetwork) => {
    const id = newRowId();
    onChange([...socials, { id, network, url: "" }]);
    setOpenId(id);
    setAdding(false);
  };

  return (
    <CardSection
      title="Social icons"
      meta={
        <PopoverPanel
          opened={adding}
          onChange={setAdding}
          width={312}
          target={<AddButton disabled={socials.length >= MAX_SOCIALS} onClick={() => setAdding((o) => !o)} />}
        >
          <div className={classes.appGrid}>
            {BIO_SOCIAL_NETWORKS.map((network) => (
              <button key={network.id} type="button" className={classes.appOption} onClick={() => add(network.id)}>
                <SocialLogo network={network.id} size="md" />
                <span>{network.label}</span>
              </button>
            ))}
          </div>
        </PopoverPanel>
      }
    >
      <Card padded={false}>
        {socials.length === 0 ? (
          <p className={classes.empty}>Add Instagram, YouTube, WhatsApp and more. Add an app twice for a second account.</p>
        ) : (
          <SortableList
            items={socials}
            itemClassName={classes.sortRow}
            onReorder={(from, to) => onChange(reorder(socials, from, to))}
            renderItem={(social, handle) => (
              <SocialRowEditor
                social={social}
                open={openId === social.id}
                handle={handle}
                onToggleOpen={() => setOpenId((id) => (id === social.id ? null : social.id))}
                onChange={(patch) => onChange(patchById(socials, social.id, patch))}
                onRemove={() => onChange(removeById(socials, social.id))}
              />
            )}
          />
        )}
      </Card>
    </CardSection>
  );
}
