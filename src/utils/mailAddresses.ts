/**
 * Parsing hand-entered email recipients.
 *
 * The server parses the same shapes and is the copy that counts — this exists so
 * the composer can show a count and flag a typo *before* a send, rather than
 * after a bounce. A malformed address costs a little sender reputation, which is
 * the sort of thing worth catching while it is still free.
 */

export type ParsedAddress = {
  email: string;
  /** Falls back to the address's local part, matching the server's `personalize`. */
  name: string;
  /** The entry as typed, so the server receives what the admin actually wrote. */
  raw: string;
};

export type ParsedAddressList = {
  valid: ParsedAddress[];
  /** Entries that didn't look like addresses, kept verbatim for the error message. */
  invalid: string[];
};

/**
 * Deliberately permissive: the only real authority on an address is a delivered
 * message. This rejects the obviously malformed and nothing more — the same rule
 * the signup path uses, so the two can't disagree about what counts.
 */
const SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** `Name <address>`, so a paste from a contact list keeps its names. */
const ANGLED = /^(.*?)<([^>]+)>$/;

/**
 * Split a textarea's contents into recipients.
 *
 * Commas, semicolons and newlines all separate, because an admin pasting from a
 * spreadsheet or a mail client shouldn't have to reformat first. Duplicates are
 * dropped rather than reported: two copies of one invitation is worse than a
 * warning nobody asked for.
 */
export function parseAddressList(input: string): ParsedAddressList {
  const valid: ParsedAddress[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();

  for (const raw of input.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)) {
    const angled = ANGLED.exec(raw);
    const name = angled ? angled[1].trim().replace(/^["']|["']$/g, "") : "";
    const email = (angled ? angled[2] : raw).trim().toLowerCase();

    if (!SHAPE.test(email) || email.length > 254) {
      invalid.push(raw);
      continue;
    }
    if (seen.has(email)) continue;
    seen.add(email);

    valid.push({ email, name: name || email.split("@")[0], raw });
  }

  return { valid, invalid };
}
