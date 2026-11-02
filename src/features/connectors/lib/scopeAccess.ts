import type { ConnectorScope } from "./connectorApi";

export function grantsWrites(scopes: ConnectorScope[]): boolean {
  return scopes.some((s) => s.scope.endsWith(":write"));
}

export function accessSummary(scopes: ConnectorScope[]): string {
  return grantsWrites(scopes)
    ? "Access to one workspace. It can add and edit tasks and notes, and can't delete anything."
    : "Read-only access to one workspace.";
}

export function accessAssurance(scopes: ConnectorScope[]): string {
  return grantsWrites(scopes)
    ? "Creates and updates only what you ask for. Nothing can be deleted."
    : "Read-only — nothing can be created, changed or deleted.";
}
