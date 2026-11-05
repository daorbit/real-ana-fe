import type { CampaignContact } from "@/features/campaigns/types";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_IMPORTED_CONTACTS = 5_000;

function clean(cell: string): string {
  return cell.trim().replace(/^"|"$/g, "").trim();
}

export function parseContacts(text: string): { contacts: CampaignContact[]; skipped: number } {
  const unique = new Map<string, CampaignContact>();
  let skipped = 0;

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = line.split(/[,;\t]/).map(clean);
    const email = cells.find((cell) => EMAIL.test(cell))?.toLowerCase();
    if (!email) {
      skipped += 1;
      continue;
    }
    const name = cells.find((cell) => cell && cell.toLowerCase() !== email) ?? "";
    if (unique.size < MAX_IMPORTED_CONTACTS) unique.set(email, { email, name });
    else skipped += 1;
  }

  return { contacts: [...unique.values()], skipped };
}

export function contactsToText(contacts: CampaignContact[]): string {
  return contacts.map((contact) => (contact.name ? `${contact.email}, ${contact.name}` : contact.email)).join("\n");
}
