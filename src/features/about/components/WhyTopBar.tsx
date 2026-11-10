import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { CalendarIcon } from "lucide-react";
import { QuantalogMark } from "@/shared/ui/QuantalogMark";
import classes from "./Why.module.css";

export function WhyTopBar({ onBookDemo }: { onBookDemo: () => void }) {
  return (
    <div className={classes.topBar}>
      <Link to="/" className={classes.brand}>
        <QuantalogMark size={28} />
        Quantalog
      </Link>
      <div className={classes.topActions}>
        <Button variant="default" radius={10} leftSection={<CalendarIcon size={15} />} onClick={onBookDemo}>
          Book a demo
        </Button>
        <Button component={Link} to="/app" radius={10}>
          Open Quantalog
        </Button>
      </div>
    </div>
  );
}
