import { useState } from "react";
import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
import { Link2, type LucideIcon } from "lucide-react";
import classes from "./Backlinks.module.css";

export function UrlForm({
  placeholder,
  label,
  hint,
  icon: Icon,
  loading,
  onSubmit,
  size = "sm",
}: {
  placeholder: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  loading: boolean;
  onSubmit: (url: string) => Promise<boolean>;
  size?: "sm" | "md";
}) {
  const [url, setUrl] = useState("");

  const submit = async () => {
    if (loading || !url.trim()) return;
    if (await onSubmit(url)) setUrl("");
  };

  return (
    <div className={classes.urlForm}>
      <TextInput
        size={size}
        radius="md"
        placeholder={placeholder}
        aria-label={label}
        leftSection={<Link2 size={15} />}
        value={url}
        onChange={(e) => setUrl(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        rightSectionWidth={size === "md" ? 44 : 38}
        rightSection={
          <Tooltip label={label} withArrow>
            <ActionIcon
              color="emerald"
              radius="md"
              size={size === "md" ? 32 : 28}
              loading={loading}
              disabled={!url.trim()}
              onClick={submit}
              aria-label={label}
            >
              <Icon size={15} />
            </ActionIcon>
          </Tooltip>
        }
      />
      <p className={classes.hint}>{hint}</p>
    </div>
  );
}
