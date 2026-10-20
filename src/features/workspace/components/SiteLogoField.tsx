import { useState } from "react";
import { Button } from "@mantine/core";
import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MediaPickerModal } from "@/features/media/components/MediaPickerModal";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import classes from "./SiteLogoField.module.css";

export function SiteLogoField({
  value,
  onChange,
  domain,
  label,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  domain: string;
  label?: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const [picking, setPicking] = useState(false);
  const cleanDomain = domain.trim().replace(/^https?:\/\//i, "");

  return (
    <div className={classes.field}>
      <span className={classes.label}>{label ?? t("workspaces.siteLogo", "Site logo")}</span>
      <div className={classes.row}>
        <span className={classes.preview}>
          <SiteFavicon domain={cleanDomain} logoUrl={value || undefined} size={30} />
        </span>
        <div className={classes.text}>
          <span className={classes.hint}>
            {value
              ? t("workspaces.siteLogoSet", "Shown wherever this site appears in Quantalog.")
              : t(
                  "workspaces.siteLogoHint",
                  "Optional. Add one if your favicon doesn't show up, or to use a sharper mark.",
                )}
          </span>
          <div className={classes.actions}>
            <Button
              size="xs"
              variant="default"
              leftSection={<ImagePlus size={14} />}
              onClick={() => setPicking(true)}
              disabled={disabled}
            >
              {value ? t("workspaces.changeLogo", "Change") : t("workspaces.chooseLogo", "Upload logo")}
            </Button>
            {value && (
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                leftSection={<Trash2 size={14} />}
                onClick={() => onChange("")}
                disabled={disabled}
              >
                {t("workspaces.removeLogo", "Remove")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <MediaPickerModal
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(asset) => onChange(asset.url)}
        kind="image"
        title={t("workspaces.chooseSiteLogo", "Choose a site logo")}
      />
    </div>
  );
}
