import { PasswordInput } from "@mantine/core";
import type { User } from "@/shared/types";

export function ConfirmIdentityField({
  user,
  value,
  onChange,
  onSubmit,
}: {
  user: User;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <PasswordInput
      placeholder={user.hasPassword ? "Current password" : user.totpEnabled ? "PIN or 6-digit code" : "PIN"}
      autoComplete={user.hasPassword ? "current-password" : "one-time-code"}
      inputMode={user.hasPassword ? undefined : "numeric"}
      maxLength={user.hasPassword ? undefined : 6}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      onKeyDown={(e) => e.key === "Enter" && onSubmit()}
    />
  );
}
