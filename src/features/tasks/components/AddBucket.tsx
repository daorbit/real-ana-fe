import { useState } from "react";
import { TextInput, UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import classes from "./Tasks.module.css";

export function AddBucket({ busy, onAdd }: { busy: boolean; onAdd: (name: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const submit = async () => {
    const value = name.trim();
    if (!value || busy) {
      setOpen(false);
      return;
    }
    if (await onAdd(value)) {
      setName("");
      setOpen(false);
    }
  };

  return (
    <div className={classes.addBucket}>
      {open ? (
        <TextInput
          size="sm"
          placeholder="Bucket name"
          value={name}
          maxLength={40}
          autoFocus
          onChange={(e) => setName(e.currentTarget.value)}
          onBlur={() => void submit()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
            if (e.key === "Escape") {
              setName("");
              setOpen(false);
            }
          }}
          aria-label="New bucket name"
        />
      ) : (
        <UnstyledButton className={classes.addBucketButton} onClick={() => setOpen(true)}>
          <Plus size={15} />
          Add new bucket
        </UnstyledButton>
      )}
    </div>
  );
}
