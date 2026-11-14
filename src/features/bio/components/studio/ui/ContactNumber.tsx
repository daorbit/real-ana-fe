import { useState } from "react";
import { PhoneInput } from "@/shared/ui/PhoneInput";
import { useHomeDialCode } from "@/features/auth/hooks/useHomeDialCode";
import { initialNumber, numberInLink, numberLink, type ContactKind } from "@/features/bio/lib/contactLink";
import type { DialCode } from "@/shared/lib/dialCodes";

function digitsOf(local: string): string {
  return local.replace(/\D/g, "").replace(/^0+/, "");
}

export function ContactNumber({
  kind,
  url,
  autoFocus,
  onChange,
}: {
  kind: ContactKind;
  url: string;
  autoFocus?: boolean;
  onChange: (url: string) => void;
}) {
  const home = useHomeDialCode();
  const [value, setValue] = useState(() => initialNumber(numberInLink(kind, url), home));

  const update = (country: DialCode, local: string) => {
    setValue({ country, local });
    const digits = digitsOf(local);
    onChange(digits ? numberLink(kind, `${country.dial}${digits}`) : "");
  };

  return (
    <PhoneInput
      label=""
      size="xs"
      withinPortal={false}
      autoFocus={autoFocus}
      country={value.country}
      local={value.local}
      onCountry={(country) => update(country, value.local)}
      onLocal={(local) => update(value.country, local)}
    />
  );
}
