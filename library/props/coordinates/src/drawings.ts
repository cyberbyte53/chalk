import type { PartDrawing } from "@chalk/player";
import { cluesDrawing } from "./clues-view";
import { diceDrawing } from "./dice-view";
import type { PIECES } from "./pieces";
import { placesDrawing } from "./places-view";
import { plottingDrawing } from "./plotting-view";
import { readingDrawing } from "./reading-view";
import { walkerDrawing } from "./walker-view";

/**
 * Each piece's drawing, by its name (pieces.ts): one line a piece, `<name>: <name>Drawing`. The type
 * keeps it to one drawing per piece. Only a list, left out of a board's code fingerprint as
 * pieces.ts is.
 */
export const DRAWINGS: { readonly [N in keyof typeof PIECES]: PartDrawing } = {
  reading: readingDrawing,
  places: placesDrawing,
  walker: walkerDrawing,
  clues: cluesDrawing,
  plotting: plottingDrawing,
  dice: diceDrawing,
};
