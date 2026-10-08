import { Button, FileButton, Group, Text } from "@mantine/core";
import { ImageUp, RotateCcw } from "lucide-react";
import { LinkLogo } from "@/app/shell/LinkLogo";
import { notify } from "@/shared/lib/notify";
import classes from "./Sidebar.module.css";

const MAX_BYTES = 1024 * 1024;
const TYPES = "image/png,image/jpeg,image/webp,image/gif";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function LogoPicker({
  url,
  label,
  logoUrl,
  custom,
  onPick,
  onReset,
}: {
  url: string;
  label: string;
  logoUrl: string;
  custom: boolean;
  onPick: (dataUrl: string) => void;
  onReset: () => void;
}) {
  const pick = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      notify.error("Choose an image under 1 MB.");
      return;
    }
    try {
      onPick(await readAsDataUrl(file));
    } catch {
      notify.error("Couldn't read that image.");
    }
  };

  return (
    <div className={classes.logoPicker}>
      <span className={classes.logoPreview}>
        <LinkLogo url={url} logoUrl={logoUrl} label={label || "Link"} size={44} />
      </span>
      <div className={classes.logoMeta}>
        <Text size="sm" fw={600}>Logo</Text>
        <Text size="xs" c="dimmed">
          {custom ? "Custom logo" : "Uses the website's icon. Upload a PNG, JPG, WebP or GIF up to 1 MB to replace it."}
        </Text>
        <Group gap={8} mt={8}>
          <FileButton accept={TYPES} onChange={(f) => void pick(f)}>
            {(props) => (
              <Button {...props} size="xs" variant="default" leftSection={<ImageUp size={14} />}>
                {custom ? "Replace" : "Upload logo"}
              </Button>
            )}
          </FileButton>
          {custom && (
            <Button size="xs" variant="subtle" color="gray" leftSection={<RotateCcw size={14} />} onClick={onReset}>
              Use website icon
            </Button>
          )}
        </Group>
      </div>
    </div>
  );
}
