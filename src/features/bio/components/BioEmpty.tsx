import { useMemo } from "react";
import { Button } from "@mantine/core";
import { BarChart3, Palette, Plus, Share2 } from "lucide-react";
import { demoBioPages } from "@/features/demo/demoBio";
import { toBioInput } from "@/features/bio/lib/bioDraft";
import { PhonePreview } from "./studio/PhonePreview";
import classes from "./BioEmpty.module.css";

const POINTS = [
  { icon: Palette, title: "Ready in a minute", text: "A photo, a short bio, your links and social icons, in your colours." },
  { icon: Share2, title: "One address for every bio", text: "Paste it into Instagram, LinkedIn, TikTok or X and keep it there." },
  { icon: BarChart3, title: "See what people tap", text: "Views and clicks for every link, with bots left out." },
];

export function BioEmpty({ canEdit, onCreate }: { canEdit: boolean; onCreate: () => void }) {
  const sample = useMemo(() => toBioInput(demoBioPages().pages[0]), []);

  return (
    <section className={classes.empty}>
      <div className={classes.intro}>
        <div className={classes.eyebrow}>Quantalog Link-in-bio</div>
        <h2 className={classes.title}>One link for everything you share.</h2>
        <p className={classes.text}>
          Build a clean page of your most important links, put its address in your social bios, and see which links your
          audience actually taps.
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
            Create your first page
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
