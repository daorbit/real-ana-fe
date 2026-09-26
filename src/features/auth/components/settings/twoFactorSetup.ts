export type TotpSetup = { secret: string; qrDataUrl: string };

export function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}

export function downloadBackupCodes(codes: string[]) {
  const blob = new Blob(
    [
      "Quantalog two-factor backup codes\n",
      "Each code works once, in place of a code from your authenticator app.\n\n",
      codes.join("\n"),
      "\n",
    ],
    { type: "text/plain" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quantalog-backup-codes.txt";
  a.click();
  URL.revokeObjectURL(url);
}
