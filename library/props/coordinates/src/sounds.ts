import { diceSound } from "./dice-sound";
import type { PieceSound } from "./piece-sound";
import { plottingSound } from "./plotting-sound";
import { walkerSound } from "./walker-sound";

/**
 * The pieces that sound, by name (pieces.ts): one line a piece, `<name>: <name>Sound`; a piece with
 * no sound has none. Only a list, left out of a board's code fingerprint as pieces.ts is.
 */
export const SOUNDS: Readonly<Record<string, PieceSound>> = {
  walker: walkerSound,
  plotting: plottingSound,
  dice: diceSound,
};
