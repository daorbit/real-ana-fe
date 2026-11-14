import { useMemo } from "react";
import { Button } from "@mantine/core";
import { ChartSpline, Palette, Plus, Share2 } from "lucide-react";
import { demoBioPages } from "@/features/demo/demoBio";
import { toBioInput } from "@/features/bio/lib/bioDraft";
import { PhonePreview } from "./studio/PhonePreview";
import classes from "./BioEmpty.module.css";

const POINTS = [
  { icon: Palette, title: "Bio pages", text: "A photo, a short bio, your links and social icons, in your colours." },
  { icon: Share2, title: "Smart links", text: "One page per song, video or product. Paste a link and every service gets its own row." },
  { icon: ChartSpline, title: "See what people tap", text: "Clicks per button, where visitors came from, their country and device." },
];

export function BioEmpty({ canEdit, onCreate }: { canEdit: boolean; onCreate: () => void }) {
  const sample = useMemo(() => toBioInput(demoBioPages().pages[0]), []);

  return (
    <section className={classes.empty}>
      <div className={classes.intro}>
        <div className={classes.eyebrow}>Quantalog Link-in-bio & Smart Links</div>
        <h2 className={classes.title}>Short links for everything you share.</h2>
        <p className={classes.text}>
          Make a bio page for your social profiles and a smart link for every release, each at a short address with a QR
          code, and see which buttons your audience actually taps.
        </p>

        <ul className={classes.points}>
          {POINTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className={classes.point}>
              <span className={classes.pointIcon} aria-hidden>
                <Icon size={17} />
              </span>
              <div>
                <div className={classes.pointTitle}>{title}</div>
                <div className={classes.pointText}>{text}</div>
              </div>
            </li>
          ))}
        </ul>

        {canEdit ? (
          <Button size="md" leftSection={<Plus size={16} />} onClick={onCreate}>
            Create your first link
          </Button>
        ) : (
          <p className={classes.note}>Ask a workspace editor to create the first page.</p>
        )}
      </div>

      <div className={classes.preview} aria-hidden>
        <PhonePreview draft={sample} note={false} compact />
      </div>
    </section>
  );
}
