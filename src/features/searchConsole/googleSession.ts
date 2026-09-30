import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function isSearchConsoleSignedOut(url: string, error?: FetchBaseQueryError): boolean {
  if (error?.status !== 409 || !url.includes("/search-console")) return false;
  return (error.data as { kind?: string } | undefined)?.kind === "revoked";
}
