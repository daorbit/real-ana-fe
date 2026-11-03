import { Button } from "@mantine/core";
import { MessageCircle } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import classes from "./searchConsole.module.css";

export function AskOrbitSearchButton({
  onClick,
  label = "Ask Orbit",
  quiet = false,
}: {
  onClick: () => void;
  label?: string;
  quiet?: boolean;
}) {
  if (quiet) {
    return (
      <Button
        variant="default"
        radius="xl"
        className={classes.pillButton}
        leftSection={<MessageCircle size={15} />}
        onClick={onClick}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button variant="light" color="emerald" leftSection={<OrbitMark size={15} />} onClick={onClick}>
      {label}
    </Button>
  );
}
