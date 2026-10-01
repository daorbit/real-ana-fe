import { useState } from "react";
import { ActionIcon, TextInput, Tooltip } from "@mantine/core";
import { Link2, Plus } from "lucide-react";
import classes from "./Compare.module.css";

export function AddCompetitorForm({
  count,
  max,
  adding,
  onAdd,
  size = "sm",
}: {
  count: number;
  max: number;
  adding: boolean;
  onAdd: (url: string) => Promise<boolean>;
  size?: "sm" | "md";
}) {
  const [url, setUrl] = useState("");
  const atLimit = count >= max;

  const submit = async () => {
    if (adding || !url.trim()) return;
    if (await onAdd(url)) setUrl("");
  };

  return (
    <div>
      <TextInput
        size={size}
        radius="md"
        placeholder="https://competitor.com/page"
        aria-label="Competitor URL"
        leftSection={<Link2 size={15} />}
        value={url}
        disabled={atLimit}
        onChange={(e) => setUrl(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        rightSectionWidth={size === "md" ? 44 : 38}
        rightSection={
          <Tooltip label="Track this page" withArrow>
            <ActionIcon
              className={classes.addButton}
              color="emerald"
              radius="md"
              size={size === "md" ? 32 : 28}
              loading={adding}
              disabled={atLimit || !url.trim()}
              onClick={submit}
              aria-label="Track this page"
            >
              <Plus size={15} />
            </ActionIcon>
          </Tooltip>
        }
      />
      <p className={classes.addHint}>
        {atLimit
          ? `You are tracking the maximum of ${max}. Remove one to add another.`
          : "Public pages only — anything behind a login or firewall can't be fetched."}
      </p>
    </div>
  );
}
