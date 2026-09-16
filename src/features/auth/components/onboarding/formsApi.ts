import { api } from "@/shared/lib/http";

/**
 * The little of the forms service this step needs.
 *
 * Deliberately not in `app/store/api.ts`: that slice talks to Quantalog's own
 * API through one base URL, and these two calls go to a different service on a
 * different host, carrying a different credential. Folding them in would mean
 * teaching the shared base query about both.
 */

/** Where the forms service lives. Matches `features/leadCapture/themeParams.ts`. */
const FORMS_URL = import.meta.env.VITE_LEAD_FORMS_URL ?? "https://forms.daorbit.in";

/** A field as the generator describes it — no ids yet, no layout. */
export interface GeneratedField {
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  rows?: string[];
  content?: string;
  maxRating?: number;
  min?: number;
  max?: number;
  minRows?: number;
  maxRows?: number;
  subFields?: GeneratedField[];
}

export interface GeneratedForm {
  title: string;
  formDescription?: string;
  submitLabel?: string;
  fields: GeneratedField[];
  theme?: Record<string, unknown>;
}

/** What the caller gets told when a generation fails. */
export class FormsError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "FormsError";
    this.code = code;
  }
}

/**
 * Proof that this browser may act for the workspace inside the forms service.
 *
 * Minted by Quantalog, which holds the session; the forms service knows a
 * workspace only by the id in a URL, which is not a secret. Requires an editor
 * role — during first-run setup the user just created the workspace and owns
 * it, so this always passes.
 */
export function mintWorkspaceToken(workspaceId: string): Promise<string> {
  return api
    .post<{ token: string }>(`/api/workspaces/${workspaceId}/forms-token`, {})
    .then((r) => r.token);
}

async function readError(res: Response, fallback: string): Promise<FormsError> {
  const body = (await res.json().catch(() => null)) as
    | { message?: string; error?: string }
    | null;
  return new FormsError(body?.message ?? fallback, body?.error);
}

/**
 * Draft a form from a sentence.
 *
 * Nothing is saved by this call — the generator answers with a form and the
 * caller decides whether to keep it. Quantalog holds the model and the AI
 * quota; the forms service is a courier, so a quota refusal arrives here as a
 * message worth showing rather than a generic failure.
 */
export async function generateForm(
  workspaceId: string,
  token: string,
  prompt: string,
): Promise<GeneratedForm> {
  const res = await fetch(
    `${FORMS_URL}/api/workspaces/${encodeURIComponent(workspaceId)}/forms/generate`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    },
  );

  if (!res.ok) {
    throw await readError(res, "The form generator could not be reached.");
  }
  return (await res.json()) as GeneratedForm;
}

/** Keep a generated draft. Returns the saved form's id. */
export async function saveForm(
  workspaceId: string,
  token: string,
  form: GeneratedForm,
): Promise<{ _id: string }> {
  const res = await fetch(
    `${FORMS_URL}/api/workspaces/${encodeURIComponent(workspaceId)}/forms`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: form.title,
        title: form.title,
        description: form.formDescription,
        submitLabel: form.submitLabel,
        fields: form.fields,
        theme: form.theme,
      }),
    },
  );

  if (!res.ok) {
    throw await readError(res, "The form could not be saved.");
  }
  return (await res.json()) as { _id: string };
}
