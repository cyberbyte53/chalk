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

/** An item's id: a hash of its path in the course tree. Nobody types an id; it is never stored without its path. */
export function idOf(path: string): string {
  return hashOf({ path });
}

/**
 * A bank question's name in its family: 8 hex characters of a hash of its params (keys sorted, so
 * their order doesn't matter). The same params are the same question; new params, a new question.
 */
export function rowKey(params: Readonly<Record<string, unknown>>): string {
  return hashOf(params).slice(0, 8);
}

/**
 * An item's version: a hash of its built JSON, leaving out the version itself, and of what it is
 * made from beyond that (a board: the hash of its code). A container lists its children's versions,
 * so any change below it changes it too.
 */
export function versionOf(built: object, madeFrom?: unknown): string {
  const { version: _version, ...content } = built as Record<string, unknown>;
  return hashOf(madeFrom === undefined ? content : { ...content, madeFrom });
}
