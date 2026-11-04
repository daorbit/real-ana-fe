import { Box } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import classes from "./BrandingPreview.module.css";

interface Props {
  name: string;
  logo?: string;
}

const METHODS = ["UPI", "Cards", "Netbanking", "Wallet", "Pay Later"];

export function PaymentMock({ name, logo }: Props) {
  return (
    <Box className={classes.pay}>
      <Box className={classes.payHeader}>
        <div className={classes.payBrand}>
          <span className={classes.payLogo}>
            {logo ? <img src={logo} alt="" className={classes.payLogoImg} /> : name.charAt(0).toUpperCase()}
          </span>
          <span className={classes.payName}>{name}</span>
        </div>
        <div className={classes.payAmount}>₹500</div>
      </Box>
      <Box className={classes.payBody}>
        <div className={classes.payHeading}>Payment options</div>
        <div className={classes.payList}>
          {METHODS.map((method) => (
            <div key={method} className={classes.payMethod}>
              {method}
              <ChevronRight size={15} />
            </div>
          ))}
        </div>
        <div className={classes.paySecured}>Secured by Razorpay</div>
      </Box>
    </Box>
  );
}
