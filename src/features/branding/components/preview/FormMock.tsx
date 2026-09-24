import { Box } from "@mantine/core";
import classes from "./BrandingPreview.module.css";

interface Props {
  header: { name: string; logo: string } | null;
  showPoweredBy: boolean;
  poweredByLabel: string;
}

const FIELDS = ["Your name", "Email"];

export function FormMock({ header, showPoweredBy, poweredByLabel }: Props) {
  return (
    <Box className={`${classes.screen} ${classes.formScreen}`}>
      <Box className={classes.formCard}>
        {header && (
          <Box className={classes.brand}>
            {header.logo && <img src={header.logo} alt="" className={classes.brandLogo} />}
            {header.name && <span className={classes.brandName}>{header.name}</span>}
          </Box>
        )}
        <div className={classes.formTitle}>Contact us</div>
        {FIELDS.map((label) => (
          <Box key={label}>
            <div className={classes.fieldLabel}>{label}</div>
            <div className={classes.fieldBox} />
          </Box>
        ))}
        <div className={classes.submit}>Submit</div>
      </Box>
      {showPoweredBy && <div className={classes.poweredBy}>{poweredByLabel}</div>}
    </Box>
  );
}
