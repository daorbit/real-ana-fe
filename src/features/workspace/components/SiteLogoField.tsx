import { useRef, type ChangeEvent } from "react";
import { Loader, UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUploadSiteLogoMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { readAsDataUrl } from "@/features/media/lib";
import { notify, notifyError } from "@/shared/lib/notify";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import classes from "./SiteLogoField.module.css";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export function SiteLogoField({
  value,
  onChange,
  domain,
  disabled,
}: {
  value: string;
  onChange: (url: string) => void;
  domain: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const [upload, { isLoading: uploading }] = useUploadSiteLogoMutation();
  const input = useRef<HTMLInputElement>(null);
  const cleanDomain = domain.trim().replace(/^https?:\/\//i, "");

  const pick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = "";
    if (!file || !active?._id) return;
    if (file.size > MAX_LOGO_BYTES) {
      notify.error(t("workspaces.logoTooBig", "The logo must be 2 MB or smaller."));
      return;
    }
    try {
      const { url } = await upload({ workspaceId: active._id, file: await readAsDataUrl(file) }).unwrap();
      onChange(url);
    } catch (err) {
      notifyError(err, t("workspaces.logoUploadFailed", "Could not upload that image."));
    }
  };

  return (
    <div className={classes.field}>
      <span className={classes.label}>
        {t("workspaces.siteLogo", "Site logo")}
        <span className={classes.optional}>· {t("workspaces.optional", "optional")}</span>
      </span>
      <div className={classes.row}>
        <UnstyledButton
          className={classes.tile}
          data-empty={!value || undefined}
          onClick={() => input.current?.click()}
          disabled={disabled || uploading || !active?._id}
          aria-label={value ? t("workspaces.changeLogo", "Change logo") : t("workspaces.addLogo", "Add logo")}
        >
          {uploading ? (
            <Loader size="xs" />
          ) : value ? (
            <SiteFavicon domain={cleanDomain} logoUrl={value} size={30} />
          ) : (
            <Plus size={20} />
          )}
        </UnstyledButton>
        <input ref={input} type="file" accept={ACCEPT} className={classes.file} onChange={pick} tabIndex={-1} />
        <div className={classes.text}>
          <span className={classes.hint}>
            {value
              ? t("workspaces.siteLogoSet", "Click the logo to change it.")
              : t("workspaces.siteLogoHint", "PNG, JPG, WebP or GIF up to 2 MB. Useful when your favicon doesn't show up.")}
          </span>
          {value && !uploading && (
            <UnstyledButton className={classes.remove} onClick={() => onChange("")} disabled={disabled}>
              {t("workspaces.removeLogo", "Remove")}
            </UnstyledButton>
          )}
        </div>
      </div>
    </div>
  );
}
