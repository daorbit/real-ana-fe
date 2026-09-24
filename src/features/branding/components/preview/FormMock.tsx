import { Box } from "@mantine/core";
import classes from "./BrandingPreview.module.css";

interface Props {
  name: string;
  logo?: string;
  showPoweredBy: boolean;
  poweredByLabel: string;
}

const FIELDS = ["Your name", "Email"];

export function FormMock({ name, logo, showPoweredBy, poweredByLabel }: Props) {
  return (
    <Box className={`${classes.screen} ${classes.formScreen}`}>
      <Box className={classes.formCard}>
        <Box className={classes.brand}>
          {logo && <img src={logo} alt="" className={classes.brandLogo} />}
          <span className={classes.brandName}>{name}</span>
        </Box>
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
