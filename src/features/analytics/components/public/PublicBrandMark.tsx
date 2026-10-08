import { useState } from "react";
import { Box } from "@mantine/core";
import { BarChart3 } from "lucide-react";
import classes from "./PublicBrand.module.css";

export function PublicBrandMark({ logoUrl, name }: { logoUrl: string | null | undefined; name: string }) {
  const [broken, setBroken] = useState(false);

  if (logoUrl && !broken) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={classes.logo}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <Box className="pub-mark">
      <BarChart3 size={17} />
    </Box>
  );
}
