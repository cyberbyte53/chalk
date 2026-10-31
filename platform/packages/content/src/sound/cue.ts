import type { Localized } from "../localized";
import type { Sound } from "./clips";

/**
 * A board's cues as built (platform/docs/sound.md): what lessons write as `cue(…)`, as the player
 * reads them. Words take their turn; a sound plays alongside.
 */

/**
 * A cue of words, as built: its words (per language) and who says them (words left out: the piece says its own); for a
 * line of its own, its moment (a piece's signal, "town.walker.arrived") and the piece it is about.
 */
export type SceneWords = {
  readonly says?: Localized;
  readonly speaker?: string;
  readonly when?: string;
  /** The values its moment's signal must carry. */
  readonly where?: Readonly<Record<string, unknown>>;
  /** Its moment also has a condition in code (only shown as such). */
  readonly hasCondition?: true;
  readonly about?: string;
};

/** A sound cue: a sound (null: silence) at a moment; with `until`, it lasts (looping) till then. */
export type SceneSound = {
  readonly sound: Sound | null;
  readonly when: string;
  readonly where?: Readonly<Record<string, unknown>>;
  readonly until?: string;
};

/** Whether what a moment told carries the values `where` asks for: each the same, in any order. */
export function carries(
  told: Readonly<Record<string, unknown>>,
  where: Readonly<Record<string, unknown>> | undefined,
): boolean {
  return Object.entries(where ?? {}).every(([k, v]) => sameValue(told[k], v));
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) => sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  );
}
