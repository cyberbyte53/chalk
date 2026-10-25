import { type Board, type PropRecord, propPieces } from "@chalk/content";
import type { BoardRuntime } from "./runtime";

/**
 * What the board was when the learner pressed Continue: every prop's state (questions and words
 * included) and whether the learner touched it, so the event stands on its own. A prop placed with
 * `isInEvents: false` is left out.
 */
export function propRecords(board: Board, runtime: BoardRuntime): Record<string, PropRecord> {
  const out: Record<string, PropRecord> = {};
  for (const piece of propPieces(board.root)) {
    if (piece.isInEvents === false) continue;
    if (piece.id === undefined)
      throw new Error(`"${piece.name}" has no permanent id; run publish-lesson`);
    const state = runtime.getStored(piece.name);
    // What is saved is checked fully, even where changes are checked lightly (the shipped app). A
    // prop bug is reported, never in the learner's way: their Continue still goes through.
    const errors = runtime.checkFacts(piece.name, state);
    if (errors.length > 0)
      console.error(`${piece.name} is in a state its prop refuses: ${errors.join("; ")}`);
    out[String(piece.id)] = { isTouched: runtime.isTouched(piece.name), state: { ...state } };
  }
  return out;
}
