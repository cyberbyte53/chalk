/** A value written out in full: strings quoted, lists and objects as they are. */
export function full(v: unknown): string {
  // Quoted as written: only a quote inside and line breaks are marked.
  if (typeof v === "string") return `"${v.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  if (v === null || v === undefined) return "none";
  if (typeof v !== "object") return String(v);
  if (Array.isArray(v)) return `[${v.map(full).join(", ")}]`;
  return `{${Object.entries(v as Record<string, unknown>)
    .map(([k, x]) => `${k}: ${full(x)}`)
    .join(", ")}}`;
}
