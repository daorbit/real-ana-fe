import { Lock } from "lucide-react";
import { publicBioDisplay } from "@/features/bio/lib/bioOptions";
import type { BioPageInput } from "@/features/bio/types";
import { BioView } from "../BioView";
import classes from "./BioStudio.module.css";

export function PhonePreview({ draft }: { draft: BioPageInput }) {
  return (
    <>
      <div className={classes.phone}>
        <div className={classes.phoneBar}>
          <Lock size={11} aria-hidden />
          <span className={classes.phoneAddress}>{publicBioDisplay(draft.slug || "your-page")}</span>
        </div>
        <div className={classes.phoneScreen}>
          <BioView
            variant="preview"
            title={draft.title}
            bio={draft.bio}
            avatarUrl={draft.avatarUrl}
            links={draft.links.filter((link) => link.enabled && link.label.trim())}
            socials={draft.socials.filter((social) => social.url.trim())}
            theme={draft.theme}
          />
        </div>
      </div>
      <p className={classes.previewNote}>Live preview. Hidden links and empty fields are left out.</p>
    </>
  );
}
