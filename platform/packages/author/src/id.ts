import { createHash } from "node:crypto";
import { canonical } from "@chalk/content";

export { canonical, idOf } from "@chalk/content";

/**
 * 16 hex characters (64 bits) of the SHA-256 of some data's canonical JSON: the same as
 * @chalk/content's hashOf (which the phone uses), with Node's faster SHA-256 for the build.
 */
export function hashOf(value: unknown): string {
  return createHash("sha256").update(canonical(value)).digest("hex").slice(0, 16);
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
