import { diceSound } from "./dice-sound";
import type { PartSound } from "./part-sound";
import { plottingSound } from "./plotting-sound";
import { walkerSound } from "./walker-sound";

/**
 * The parts that sound, by name (parts.ts): one line a part, `<name>: <name>Sound`; a part with
 * no sound has none. Only a list, left out of a board's code fingerprint as parts.ts is.
 */
export const SOUNDS: Readonly<Record<string, PartSound>> = {
  walker: walkerSound,
  plotting: plottingSound,
  dice: diceSound,
};
