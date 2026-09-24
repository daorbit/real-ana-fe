import { Box } from "@mantine/core";
import classes from "./BrandingPreview.module.css";

interface Props {
  name: string;
  logo?: string;
}

const METHODS = ["UPI", "Cards", "Netbanking", "Wallet", "Pay Later"];

export function PaymentMock({ name, logo }: Props) {
  return (
    <Box className={`${classes.screen} ${classes.payScreen}`}>
      <Box className={classes.payHeader}>
        {logo ? (
          <img src={logo} alt="" className={classes.payLogo} />
        ) : (
          <div className={classes.payLogo}>{name.charAt(0).toUpperCase()}</div>
        )}
        <div className={classes.payName}>{name}</div>
        <div className={classes.payAmount}>₹500</div>
      </Box>
      <Box className={classes.payBody}>
        <div className={classes.payHeading}>Payment options</div>
        {METHODS.map((method) => (
          <div key={method} className={classes.payMethod}>
            {method}
          </div>
        ))}
        <div className={classes.paySecured}>Secured by Razorpay</div>
      </Box>
    </Box>
  );
}
