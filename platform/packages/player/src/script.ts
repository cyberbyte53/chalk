import { type Board, type Localized, NARRATOR, propPieces } from "@chalk/content";
import { Board as Core } from "@chalk/prop/next";
import type { PropModule } from "./prop-module";

/**
 * A board's script (platform/docs/sound.md): every line it says, in the order it can be heard, with
 * who says it, what the piece shows and the lesson's own words for it. The one place lines are read
 * from a board: the voice is made from it, the player says it, the preview and `look` show it.
 */
export type ScriptLine = {
  /** Its name: the piece that says it, or a narration line's own. */
  line: string;
  /** The piece, for a piece's line; none for narration. */
  piece?: string;
  /** Who says it: a character of the book's cast, the narrator when the line names no one. */
  speaker: string;
  /** What the piece says of itself (a text its words, a question its prompt): its sound view. */
  own?: Localized;
  /** The lesson's own words for it, when it gives them. */
  says?: Localized;
  /** When it is heard: the board opening, its piece appearing, or a rule saying it. */
  cue: "opening" | "appears" | "rule";
};

/** The words a piece says of itself, as it is now (its sound view; nothing for one without). */
export function ownLine(
  module: PropModule | undefined,
  view: Readonly<Record<string, unknown>>,
): Localized | undefined {
  return module?.sound?.line?.(view);
}

/**
 * Every line a board says: its pieces' (top to bottom; the opening's first, as the board opens),
 * then its narration lines. A piece that says nothing (a plane with no sound view, no words of the
 * lesson's) has no line. Today's boards say none.
 */
export function scriptOf(
  board: Board,
  lookup: (type: string) => PropModule | undefined,
): ScriptLine[] {
  const model = board.model;
  if (model === undefined) return [];
  const core = new Core(model.scene, model.given);
  const out: ScriptLine[] = [];
  for (const piece of propPieces(board.root)) {
    const given = model.lines[piece.name];
    const own = ownLine(lookup(piece.prop), core.read(piece.name));
    if (own === undefined && given?.says === undefined) continue;
    out.push({
      line: piece.name,
      piece: piece.name,
      speaker: given?.speaker ?? NARRATOR,
      ...(own === undefined ? {} : { own }),
      ...(given?.says === undefined ? {} : { says: given.says }),
      cue: piece.isHidden === true ? "appears" : "opening",
    });
  }
  for (const name of model.freeLines) {
    const free = model.lines[name];
    if (free?.says === undefined) continue;
    out.push({ line: name, speaker: free.speaker ?? NARRATOR, says: free.says, cue: "rule" });
  }
  return out;
}
