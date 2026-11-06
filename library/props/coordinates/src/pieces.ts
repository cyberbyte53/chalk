import { cluesPiece } from "./clues";
import { dicePiece } from "./dice";
import { placesPiece } from "./places";
import { plottingPiece } from "./plotting";
import { readingPiece } from "./reading";
import { walkerPiece } from "./walker";

/**
 * The pieces a board can put on the coordinate plane: a name and its entry (piece.ts), nothing
 * else. A new piece is its own files (`<name>.ts`, `<name>-view.tsx`, maybe `<name>-sound.ts` and
 * `<name>.css`) and one line here, in drawings.tsx, and in sounds.ts if it sounds.
 *
 * Only a list: a board's code fingerprint leaves this file out and counts the entries of the pieces
 * the board uses (package.json `chalk.registries`), so adding a line here leaves every board that
 * doesn't use the new piece as it was. pieces.test.ts keeps each line `<name>: <name>Piece`.
 */
export const PIECES = {
  reading: readingPiece,
  places: placesPiece,
  walker: walkerPiece,
  clues: cluesPiece,
  plotting: plottingPiece,
  dice: dicePiece,
} as const;
