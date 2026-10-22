import { ActionIcon, Button, Menu, TextInput } from "@mantine/core";
import { Plus, X } from "lucide-react";
import { BIO_SOCIAL_NETWORKS } from "@/features/bio/lib/bioOptions";
import type { BioSocial } from "@/features/bio/types";
import { SocialGlyph } from "../SocialGlyph";
import { StudioCard } from "./StudioCard";
import classes from "./BioStudio.module.css";

const NETWORK = Object.fromEntries(BIO_SOCIAL_NETWORKS.map((n) => [n.id, n]));

export function SocialsSection({ socials, onChange }: { socials: BioSocial[]; onChange: (socials: BioSocial[]) => void }) {
  const available = BIO_SOCIAL_NETWORKS.filter((n) => !socials.some((s) => s.network === n.id));

  return (
    <StudioCard title="Social icons" description="A row of small icons under your bio.">
      {socials.length > 0 && (
        <div className={classes.list}>
          {socials.map((social) => (
            <div key={social.network} className={`${classes.listRow} ${classes.socialRow}`}>
              <span className={classes.socialIcon} aria-hidden>
                <SocialGlyph network={social.network} size={18} />
              </span>
              <div className={classes.rowFields}>
                <TextInput
                  size="sm"
                  aria-label={NETWORK[social.network].label}
                  placeholder={NETWORK[social.network].placeholder}
                  value={social.url.replace(/^mailto:/, "")}
                  onChange={(e) =>
                    onChange(socials.map((s) => (s.network === social.network ? { ...s, url: e.currentTarget.value } : s)))
                  }
                />
              </div>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={`Remove ${NETWORK[social.network].label}`}
                onClick={() => onChange(socials.filter((s) => s.network !== social.network))}
              >
                <X size={15} />
              </ActionIcon>
            </div>
          ))}
        </div>
      )}

      {available.length > 0 && (
        <Menu position="bottom-start" width={220}>
          <Menu.Target>
            <Button variant="default" leftSection={<Plus size={15} />}>
              Add social icon
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {available.map((network) => (
              <Menu.Item
                key={network.id}
                leftSection={<SocialGlyph network={network.id} size={16} />}
                onClick={() => onChange([...socials, { network: network.id, url: "" }])}
              >
                {network.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </StudioCard>
  );
}
