import { createHash } from "node:crypto";

/** JSON with keys sorted at every level, so the same data always gives the same text. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

/** 16 hex characters (64 bits) of the SHA-256 of some data's canonical JSON. */
export function hashOf(value: unknown): string {
  return createHash("sha256").update(canonical(value)).digest("hex").slice(0, 16);
}

/**
 * An item's id: a hash of where it lives in content/ (its path), plus, for a question, the params
 * row that made it. Nobody types an id; renaming a folder gives its items new ids.
 */
export function idOf(path: string, params?: Readonly<Record<string, unknown>>): string {
  return hashOf(params === undefined ? { path } : { path, params });
}

/**
 * An item's version: a hash of its built JSON, leaving out the version itself and the commit it was
 * built from (the same content built from two commits is the same version). A container lists its
 * children's versions, so any change below it changes it too.
 */
export function versionOf(built: { readonly source: { readonly commit: string } }): string {
  const { source, ...rest } = built as unknown as Record<string, unknown> & {
    source: Record<string, unknown>;
  };
  const { commit: _commit, ...place } = source;
  const { version: _version, ...content } = rest;
  return hashOf({ ...content, source: place });
}
