import { UnstyledButton } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { LayoutThumb } from "@/features/dashboards/components/LayoutThumb";
import { rangeLong } from "@/features/dashboards/types";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/Dashboards.module.css";

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: Math.min(index, 10) * 0.04, duration: 0.3 }}
    >
      <UnstyledButton
        className={`${classes.galleryCard} ${classes.accent}`}
        data-accent={template.accent}
        onClick={onOpen}
        w="100%"
      >
        <div className={classes.galleryPreview}>
          <LayoutThumb layout={template.layout} limit={8} />
        </div>
        <div className={classes.galleryBody}>
          <div className={classes.templateHead}>
            <span className={classes.galleryIcon}><Icon size={16} /></span>
            <span className={classes.templateName}>{template.name}</span>
          </div>
          <span className={classes.templateTagline}>{template.tagline}</span>
          <div className={classes.templateFoot}>
            <span className={classes.galleryMeta}>
              {template.layout.length} widgets · {rangeLong(template.range)}
            </span>
            <span className={classes.galleryCta}>
              Preview <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </UnstyledButton>
    </motion.div>
  );
}
