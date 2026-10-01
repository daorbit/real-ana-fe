import { UnstyledButton } from "@mantine/core";
import { CalendarRange, Eye, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import { MiniWindow } from "@/features/dashboards/components/MiniWindow";
import { rangeLong } from "@/features/dashboards/types";
import { usesSearch } from "@/features/dashboards/templates";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/templates/Templates.module.css";

export function TemplateCard({
  template,
  index,
  onOpen,
}: {
  template: DashboardTemplate;
  index: number;
  onOpen: () => void;
}) {
  const Icon = template.icon;
  const count = template.layout.length;

  return (
    <motion.div
      className={classes.cardWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index, 10) * 0.04, duration: 0.3 }}
    >
      <UnstyledButton className={`${classes.card} ${shared.accent}`} data-accent={template.accent} onClick={onOpen}>
        <div className={classes.cardPreview}>
          <MiniWindow layout={template.layout} title={template.name} limit={10} />
          <span className={classes.previewPill}><Eye size={12} /> Preview</span>
          {usesSearch(template.layout) && (
            <span className={classes.googleTag}>
              <GoogleMark size={11} />
              Google data
            </span>
          )}
        </div>
        <div className={classes.cardBody}>
          <div className={classes.cardHead}>
            <span className={classes.cardIcon}><Icon size={16} /></span>
            <div className={classes.cardTitles}>
              <span className={classes.cardName}>{count ? template.name : "Blank canvas"}</span>
              <span className={classes.cardCategory}>{template.category ?? "Start fresh"}</span>
            </div>
          </div>
          <p className={classes.cardTagline}>{template.tagline}</p>
          <div className={classes.cardFoot}>
            <span className={classes.footItem}>
              <LayoutGrid size={12} />
              {count ? `${count} widgets` : "Your pick of widgets"}
            </span>
            <span className={classes.footItem}>
              <CalendarRange size={12} />
              {rangeLong(template.range)}
            </span>
          </div>
        </div>
      </UnstyledButton>
    </motion.div>
  );
}
