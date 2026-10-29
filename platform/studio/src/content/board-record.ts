import { createHash } from "node:crypto";

// Node's own hash, not a workspace package's: the dev server's config runs this code directly.
const hashOf = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);

/**
 * What a board is, as plain data, for knowing what changed since it was reviewed: its pieces, each
 * one's setup and words, its rules (a rule's code as its source text), and the version of each
 * prop's code it places. Made by the build from the board itself, so it can't drift from it.
 */
export type BoardRecord = {
  /** A hash of all of it: the same stamp, the same board. */
  stamp: string;
  /** Each prop type it places, and its package's code version. */
  props: Readonly<Record<string, string>>;
  /** The board as plain data, keys sorted. */
  content: unknown;
};

/** A value as plain data: functions as their source text, keys sorted, nothing undefined. */
export function plain(value: unknown): unknown {
  if (typeof value === "function") return `ƒ ${value.toString()}`;
  if (Array.isArray(value)) return value.map(plain);
  if (value instanceof Map) return plain(Object.fromEntries(value));
  if (value instanceof Set) return [...value].map(plain);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .flatMap((k) => {
          const v = (value as Record<string, unknown>)[k];
          return v === undefined ? [] : [[k, plain(v)]];
        }),
    );
  return value;
}

export function recordOf(board: object, props: Readonly<Record<string, string>>): BoardRecord {
  // Not its build item: its version hashes the whole file that makes it, so it changes when a
  // neighbouring board does.
  const { item: _, ...itself } = board as { item?: unknown };
  const content = plain(itself);
  // Plain data has its keys in one order, so the same board always gives the same stamp.
  return { stamp: hashOf(plain({ content, props })), props, content };
}

/** One difference between two records' content: where, and what it was and is. */
export type Change = { at: string; was?: unknown; now?: unknown };

/**
 * Every leaf that differs, by where it is: a list's items are named by their `name` (a piece) when
 * they have one, so a piece moving in its list is not a change of every piece after it.
 */
export function changesBetween(was: unknown, now: unknown, at = ""): Change[] {
  const isObject = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === "object" && !Array.isArray(v);
  if (Array.isArray(was) && Array.isArray(now)) {
    const named = (list: unknown[]) =>
      list.every((x) => isObject(x) && typeof x.name === "string")
        ? new Map(list.map((x) => [String((x as { name: string }).name), x]))
        : new Map(list.map((x, i) => [String(i), x]));
    const a = named(was);
    const b = named(now);
    return [...new Set([...a.keys(), ...b.keys()])].flatMap((k) =>
      changesBetween(a.get(k), b.get(k), at === "" ? k : `${at} › ${k}`),
    );
  }
  if (isObject(was) && isObject(now))
    return [...new Set([...Object.keys(was), ...Object.keys(now)])].flatMap((k) =>
      changesBetween(was[k], now[k], at === "" ? k : `${at} › ${k}`),
    );
  if (JSON.stringify(was) === JSON.stringify(now)) return [];
  return [
    {
      at,
      ...(was === undefined ? {} : { was }),
      ...(now === undefined ? {} : { now }),
    },
  ];
}
