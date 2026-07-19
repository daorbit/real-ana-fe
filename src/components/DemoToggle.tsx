import { ActionIcon, Tooltip } from "@mantine/core";
import { FlaskConical } from "lucide-react";
import { useDemo } from "../demo";

/**
 * Sidebar toggle between real numbers and generated sample data.
 *
 * Admin-only, and rendered nowhere for anyone else. It sits with the docs and
 * theme icons as one more low-frequency utility — a single button that carries
 * its state in its own colour, rather than a nested control that has to fight
 * a parent for the click.
 */
export function DemoToggle() {
  const { demo, available, toggle } = useDemo();

  if (!available) return null;

  return (
    <Tooltip label={demo ? "Showing demo data" : "Show demo data"} withArrow>
      <ActionIcon
        variant={demo ? "light" : "subtle"}
        color={demo ? "violet" : "gray"}
        onClick={() => toggle(!demo)}
        aria-pressed={demo}
        aria-label={demo ? "Show real data" : "Show demo data"}
      >
        <FlaskConical size={16} />
      </ActionIcon>
    </Tooltip>
  );
}
