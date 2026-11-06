import { cluesPart } from "./clues";
import { dicePart } from "./dice";
import { placesPart } from "./places";
import { plottingPart } from "./plotting";
import { readingPart } from "./reading";
import { walkerPart } from "./walker";

/**
 * The parts a board can put on the coordinate plane: a name and its entry (part.ts), nothing
 * else. A new part is its own files (`<name>.ts`, `<name>-view.tsx`, maybe `<name>-sound.ts` and
 * `<name>.css`) and one line here, in drawings.tsx, and in sounds.ts if it sounds.
 *
 * Only a list: a board's code fingerprint leaves this file out and counts the entries of the parts
 * the board uses (package.json `chalk.registries`), so adding a line here leaves every board that
 * doesn't use the new part as it was. part-list.test.ts keeps each line `<name>: <name>Part`.
 */
export const PARTS = {
  reading: readingPart,
  places: placesPart,
  walker: walkerPart,
  clues: cluesPart,
  plotting: plottingPart,
  dice: dicePart,
} as const;
