import type { PartDrawing } from "@chalk/player";
import { cluesDrawing } from "./clues-view";
import { diceDrawing } from "./dice-view";
import type { PARTS } from "./parts";
import { placesDrawing } from "./places-view";
import { plottingDrawing } from "./plotting-view";
import { readingDrawing } from "./reading-view";
import { walkerDrawing } from "./walker-view";

/**
 * Each part's drawing, by its name (parts.ts): one line a part, `<name>: <name>Drawing`. The type
 * keeps it to one drawing per part. Only a list, left out of a board's code fingerprint as
 * parts.ts is.
 */
export const DRAWINGS: { readonly [N in keyof typeof PARTS]: PartDrawing } = {
  reading: readingDrawing,
  places: placesDrawing,
  walker: walkerDrawing,
  clues: cluesDrawing,
  plotting: plottingDrawing,
  dice: diceDrawing,
};
