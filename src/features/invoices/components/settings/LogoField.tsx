import { Button, FileButton } from "@mantine/core";
import { ImageUp, Trash2 } from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { MAX_LOGO_BYTES } from "../../lib/invoicingOptions";
import classes from "./fields.module.css";

const ACCEPT = "image/png,image/jpeg,image/svg+xml";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function LogoField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const pick = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      notify.error("The logo must be smaller than 300 KB.");
      return;
    }
    try {
      onChange(await readAsDataUrl(file));
    } catch {
      notify.error("Could not read that image.");
    }
  };

  return (
    <div className={classes.logoRow}>
      <div className={classes.logoBox}>
        {value ? (
          <img src={value} alt="Business logo" className={classes.logoImage} />
        ) : (
          <span className={classes.logoEmpty}>No logo</span>
        )}
      </div>
      <FileButton accept={ACCEPT} onChange={(file) => void pick(file)}>
        {(props) => (
          <Button {...props} variant="default" leftSection={<ImageUp size={15} />}>
            {value ? "Replace" : "Upload logo"}
          </Button>
        )}
      </FileButton>
      {value && (
        <Button variant="subtle" color="gray" leftSection={<Trash2 size={15} />} onClick={() => onChange("")}>
          Remove
        </Button>
      )}
    </div>
  );
}
