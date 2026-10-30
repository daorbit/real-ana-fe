const HTML_TAG = /<\/?(?:a|b|blockquote|br|div|em|h[1-6]|i|li|ol|p|s|strong|u|ul)(?:\s|\/?>)/i;
const BLOCK_TAG = new Set(["blockquote", "div", "li", "p"]);

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function editorContent(value: string): string {
  if (!value) return "<p></p>";
  if (HTML_TAG.test(value)) return value;
  return `<p>${escapeHtml(value).replace(/\r?\n/g, "<br>")}</p>`;
}

function textFromNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof Element)) return "";
  if (node.tagName === "BR") return " ";
  const text = Array.from(node.childNodes, textFromNode).join("");
  return BLOCK_TAG.has(node.tagName.toLowerCase()) ? `${text} ` : text;
}

export function taskNotesPlainText(value: string): string {
  if (!value || typeof DOMParser === "undefined") return value;
  const parsed = new DOMParser().parseFromString(editorContent(value), "text/html");
  return Array.from(parsed.body.childNodes, textFromNode).join("").replace(/\s+/g, " ").trim();
}
