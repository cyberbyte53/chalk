import { type Board, NARRATOR, propPieces } from "@chalk/content";
import type { Spoken } from "@chalk/prop";
import { Board as Core } from "@chalk/prop/next";

/**
 * A board's script: every line it says, in the order the board shows them, with who says it and
 * whether it is said when the board opens or when a rule shows it. The one place lines are read
 * from a board: the voice is made from it, and the preview, `look` and review show it.
 */
export type ScriptLine = {
  /** The piece that says it ("fiveHouses"). */
  piece: string;
  /** Who says it: a character of the cast, the narrator when the line names no one. */
  speaker: string;
  line: Spoken;
  /** Said when a rule shows it, not when the board opens. */
  isLater: boolean;
};

/** Every line a board says (a scene's speaking pieces), top to bottom. Today's boards say none. */
export function scriptOf(board: Board): ScriptLine[] {
  const model = board.model;
  if (model === undefined) return [];
  const core = new Core(model.scene, model.given);
  const out: ScriptLine[] = [];
  for (const piece of propPieces(board.root)) {
    const def = model.scene.children?.[piece.name];
    const line = (def?.speech as ((me: unknown) => Spoken | undefined) | undefined)?.(
      core.read(piece.name),
    );
    if (line === undefined) continue;
    out.push({
      piece: piece.name,
      speaker: line.speaker ?? NARRATOR,
      line,
      isLater: piece.isHidden === true,
    });
  }
  return out;
}
