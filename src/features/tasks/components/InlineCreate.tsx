import { useState } from "react";
import { Button, Textarea, UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import classes from "./Tasks.module.css";

export function InlineCreate({ busy, onCreate }: { busy: boolean; onCreate: (title: string) => Promise<boolean> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const submit = async () => {
    const value = title.trim();
    if (!value || busy) return;
    if (await onCreate(value)) setTitle("");
  };

  const close = () => {
    setOpen(false);
    setTitle("");
  };

  if (!open) {
    return (
      <UnstyledButton className={classes.addTask} onClick={() => setOpen(true)}>
        <Plus size={15} />
        Add task
      </UnstyledButton>
    );
  }

  return (
    <div className={classes.createBox}>
      <Textarea
        variant="unstyled"
        autosize
        minRows={2}
        maxLength={200}
        placeholder="Enter a task name"
        value={title}
        autoFocus
        onChange={(e) => setTitle(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void submit();
          }
          if (e.key === "Escape") close();
        }}
        aria-label="New task name"
      />
      <div className={classes.createActions}>
        <Button size="compact-sm" variant="subtle" color="gray" onClick={close}>
          Cancel
        </Button>
        <Button size="compact-sm" loading={busy} disabled={!title.trim()} onClick={() => void submit()}>
          Add task
        </Button>
      </div>
    </div>
  );
}
