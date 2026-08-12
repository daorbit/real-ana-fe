import { getToken } from "@/shared/lib/http";

const BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Download a form's submissions as CSV.
 *
 * Fetched and turned into a blob rather than pointed at with an `<a download>`:
 * the endpoint is authenticated with a bearer token, and a plain link sends no
 * Authorization header — it would 401 and hand the user a downloaded error page
 * named `submissions.csv`.
 *
 * The plan check is enforced server-side too. This throws with the server's own
 * message on a 402, so the caller can show the upgrade reason rather than a
 * generic failure.
 */
export async function downloadSubmissionsCsv(formId: string, formName: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${BASE}/api/forms/${formId}/submissions.csv`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    let message = `Export failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = String(body.error);
    } catch {
      /* a non-JSON failure keeps the status line above */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${formName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "submissions"}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked on the next tick rather than immediately: Safari cancels an
  // in-flight download when its blob URL is released synchronously after click.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** The public URL a published form is served at. */
export function hostedFormUrl(formKey: string): string {
  const site = import.meta.env.VITE_SITE_ORIGIN ?? "https://quantalog.com";
  return `${site}/f/${formKey}`;
}

/** The iframe snippet shown on the share card. */
export function embedSnippet(formKey: string): string {
  return `<iframe src="${hostedFormUrl(formKey)}" width="100%" height="700" frameborder="0" style="border:0" title="Form"></iframe>`;
}
